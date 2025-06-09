import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper function to call Gemini API
async function callGeminiAPI(prompt: string): Promise<string> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.3,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    }
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response structure from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error(`Error calling Gemini API:`, error);
    throw error;
  }
}

// Helper function to get user's site data and recent activity
async function getUserSiteData(userId: string, siteId?: string) {
  try {
    // Get user's sites
    const { data: sites, error: sitesError } = await supabase
      .from('sites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (sitesError) throw sitesError;

    let selectedSite = null;
    if (siteId) {
      selectedSite = sites?.find(site => site.id === siteId) || null;
    } else if (sites && sites.length > 0) {
      selectedSite = sites[0];
    }

    let auditData = null;
    let citationData = null;
    let summaryData = null;
    let entityData = null;
    let competitorData = null;
    let recentActivity = null;

    if (selectedSite) {
      // Get latest audit
      const { data: audits } = await supabase
        .from('audits')
        .select('*')
        .eq('site_id', selectedSite.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      auditData = audits?.[0] || null;

      // Get recent citations
      const { data: citations } = await supabase
        .from('citations')
        .select('*')
        .eq('site_id', selectedSite.id)
        .order('detected_at', { ascending: false })
        .limit(5);
      
      citationData = citations || [];

      // Get recent summaries
      const { data: summaries } = await supabase
        .from('summaries')
        .select('*')
        .eq('site_id', selectedSite.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      summaryData = summaries || [];

      // Get entities with gaps (most actionable)
      const { data: entities } = await supabase
        .from('entities')
        .select('*')
        .eq('site_id', selectedSite.id)
        .order('mention_count', { ascending: false })
        .limit(10);
      
      entityData = entities || [];

      // Get competitors
      const { data: competitors } = await supabase
        .from('competitor_sites')
        .select('*')
        .eq('user_id', userId)
        .eq('site_id', selectedSite.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      competitorData = competitors || [];

      // Analyze recent activity patterns
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      recentActivity = {
        hasRecentAudit: auditData && new Date(auditData.created_at) > oneWeekAgo,
        hasRecentCitations: citationData.some(c => new Date(c.detected_at) > oneWeekAgo),
        hasRecentSummaries: summaryData.some(s => new Date(s.created_at) > oneWeekAgo),
        entityGapsCount: entityData.filter(e => e.gap).length,
        competitorCount: competitorData.length,
        auditAge: auditData ? Math.floor((now.getTime() - new Date(auditData.created_at).getTime()) / (1000 * 60 * 60 * 24)) : null
      };
    }

    return {
      sites: sites || [],
      selectedSite,
      auditData,
      citationData,
      summaryData,
      entityData,
      competitorData,
      recentActivity
    };
  } catch (error) {
    console.error('Error fetching user site data:', error);
    return {
      sites: [],
      selectedSite: null,
      auditData: null,
      citationData: [],
      summaryData: [],
      entityData: [],
      competitorData: [],
      recentActivity: null
    };
  }
}

// Helper function to create contextual prompt with personality
function createContextualPrompt(message: string, userData: any, context: any): string {
  const { sites, selectedSite, auditData, citationData, summaryData, entityData, competitorData, recentActivity } = userData;
  
  let contextInfo = `You are Genie, an intelligent and helpful AI assistant for SEOgenix, a platform that helps users optimize their content for AI visibility. You have a friendly, knowledgeable personality and provide actionable advice with enthusiasm.

PERSONALITY TRAITS:
- Friendly and approachable, like a knowledgeable friend
- Use occasional emojis (✨, 🚀, 💡, 📊, 🎯) to make responses engaging
- Provide specific, actionable advice rather than generic tips
- Reference the user's actual data when giving recommendations
- Be encouraging and supportive, especially when users face challenges
- Use "**bold text**" for important points and recommendations

USER CONTEXT:
- Total sites: ${sites.length}
- Current page: ${context.current_page || 'unknown'}
- User activity: ${context.user_activity ? JSON.stringify(context.user_activity) : 'unknown'}
`;

  if (selectedSite) {
    contextInfo += `
SELECTED SITE: ${selectedSite.name} (${selectedSite.url})
`;

    if (auditData) {
      const overallScore = Math.round((
        auditData.ai_visibility_score +
        auditData.schema_score +
        auditData.semantic_score +
        auditData.citation_score +
        auditData.technical_seo_score
      ) / 5);

      contextInfo += `
LATEST AUDIT RESULTS:
- Overall Score: ${overallScore}/100
- AI Visibility: ${auditData.ai_visibility_score}/100
- Schema Score: ${auditData.schema_score}/100
- Semantic Score: ${auditData.semantic_score}/100
- Citation Score: ${auditData.citation_score}/100
- Technical SEO: ${auditData.technical_seo_score}/100
- Audit Date: ${new Date(auditData.created_at).toLocaleDateString()}
- Audit Age: ${recentActivity?.auditAge || 'unknown'} days old
`;

      // Identify the lowest scoring area for recommendations
      const scores = {
        'AI Visibility': auditData.ai_visibility_score,
        'Schema': auditData.schema_score,
        'Semantic': auditData.semantic_score,
        'Citation': auditData.citation_score,
        'Technical SEO': auditData.technical_seo_score
      };
      const lowestArea = Object.entries(scores).reduce((a, b) => scores[a[0]] < scores[b[0]] ? a : b);
      contextInfo += `- PRIORITY AREA: ${lowestArea[0]} (${lowestArea[1]}/100) - needs most attention\n`;
    }

    if (citationData.length > 0) {
      contextInfo += `
CITATIONS FOUND: ${citationData.length}
- Citation Sources: ${citationData.map(c => c.source_type).join(', ')}
- Recent Citations: ${recentActivity?.hasRecentCitations ? 'Yes' : 'No'}
`;
    }

    if (summaryData.length > 0) {
      contextInfo += `
GENERATED SUMMARIES: ${summaryData.length}
- Summary Types: ${summaryData.map(s => s.summary_type).join(', ')}
- Recent Summaries: ${recentActivity?.hasRecentSummaries ? 'Yes' : 'No'}
`;
    }

    if (entityData.length > 0) {
      const entitiesWithGaps = entityData.filter(e => e.gap);
      contextInfo += `
ENTITY ANALYSIS:
- Total Entities: ${entityData.length}
- Entities with Coverage Gaps: ${entitiesWithGaps.length}
- Top Entities: ${entityData.slice(0, 3).map(e => e.entity_name).join(', ')}
${entitiesWithGaps.length > 0 ? `- GAPS TO ADDRESS: ${entitiesWithGaps.slice(0, 3).map(e => e.entity_name).join(', ')}` : ''}
`;
    }

    if (competitorData.length > 0) {
      contextInfo += `
COMPETITORS TRACKED: ${competitorData.length}
- Competitor Names: ${competitorData.map(c => c.name).join(', ')}
`;
    }

    if (recentActivity) {
      contextInfo += `
RECENT ACTIVITY ANALYSIS:
- Recent Audit: ${recentActivity.hasRecentAudit ? 'Yes' : 'No'}
- Recent Citations: ${recentActivity.hasRecentCitations ? 'Yes' : 'No'}
- Recent Summaries: ${recentActivity.hasRecentSummaries ? 'Yes' : 'No'}
- Entity Gaps: ${recentActivity.entityGapsCount}
- Competitors: ${recentActivity.competitorCount}
`;
    }
  }

  // Add page-specific context
  const pageContext = getPageSpecificContext(context.current_page);
  if (pageContext) {
    contextInfo += `\nCURRENT PAGE CONTEXT: ${pageContext}\n`;
  }

  contextInfo += `

SEOGEMIX FEATURES TO RECOMMEND:
- **AI Visibility Audit**: Comprehensive analysis of AI visibility factors
- **Competitive Analysis**: Compare performance against competitors  
- **AI Content Optimizer**: Analyze and optimize content for AI systems
- **Schema Generator**: Create structured data markup
- **Citation Tracker**: Monitor AI system citations
- **Voice Assistant Tester**: Test voice assistant responses
- **LLM Site Summaries**: Generate AI-optimized summaries
- **Entity Coverage Analyzer**: Identify content gaps
- **Prompt Match Suggestions**: Generate AI-optimized prompts
- **AI Content Generator**: Create AI-friendly content

RESPONSE GUIDELINES:
1. **Be specific and actionable** - reference the user's actual data
2. **Prioritize recommendations** based on their audit scores and gaps
3. **Suggest relevant SEOgenix features** that can help with their specific issues
4. **Be encouraging** - frame challenges as opportunities
5. **Use formatting** - bold important points, use bullet points for lists
6. **Include next steps** - tell them exactly what to do next
7. **Reference their site by name** when giving advice
8. **Use emojis sparingly** but effectively to add personality

USER QUESTION: ${message}

Provide a helpful, contextual response as Genie that addresses their specific situation:`;

  return contextInfo;
}

// Helper function to get page-specific context
function getPageSpecificContext(currentPage: string): string {
  const pageContexts: { [key: string]: string } = {
    '/dashboard': 'User is viewing their main dashboard with site overview and quick stats',
    '/ai-visibility-audit': 'User is on the AI Visibility Audit page, likely wanting to understand or improve their audit scores',
    '/competitive-analysis': 'User is analyzing competitors and comparing performance',
    '/ai-content-optimizer': 'User is optimizing content for AI systems and wants to improve content scores',
    '/schema-generator': 'User is working with schema markup and structured data',
    '/citation-tracker': 'User is tracking AI citations and mentions of their content',
    '/voice-assistant-tester': 'User is testing voice assistant responses about their site',
    '/llm-site-summaries': 'User is generating or reviewing LLM-optimized summaries',
    '/entity-coverage-analyzer': 'User is analyzing entity coverage and identifying content gaps',
    '/prompt-match-suggestions': 'User is generating AI-optimized prompts and suggestions',
    '/ai-content-generator': 'User is creating AI-friendly content',
    '/account-settings': 'User is managing their account and subscription settings'
  };

  return pageContexts[currentPage] || '';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log(`✨ Genie chatbot function called`);
    
    const { message, user_id, site_id, context } = await req.json();
    
    if (!message || typeof message !== 'string') {
      throw new Error('Message is required and must be a string');
    }

    if (!user_id) {
      throw new Error('User ID is required');
    }

    console.log(`💬 Processing message: "${message.substring(0, 50)}..." for user: ${user_id}`);

    // Get user's site data and activity for context
    const userData = await getUserSiteData(user_id, site_id);
    
    console.log(`📊 User data loaded:`, {
      sites: userData.sites.length,
      selectedSite: userData.selectedSite?.name,
      hasAudit: !!userData.auditData,
      citations: userData.citationData.length,
      summaries: userData.summaryData.length,
      entities: userData.entityData.length,
      competitors: userData.competitorData.length,
      recentActivity: userData.recentActivity
    });

    // Create contextual prompt with Genie's personality
    const prompt = createContextualPrompt(message, userData, context || {});
    
    console.log(`🧠 Calling Gemini API with contextual prompt...`);
    
    // Get AI response
    const aiResponse = await callGeminiAPI(prompt);
    
    console.log(`✅ Genie response generated (${aiResponse.length} characters)`);

    return new Response(
      JSON.stringify({
        response: aiResponse,
        context_used: {
          sites_count: userData.sites.length,
          selected_site: userData.selectedSite?.name,
          has_audit_data: !!userData.auditData,
          citations_count: userData.citationData.length,
          summaries_count: userData.summaryData.length,
          entities_count: userData.entityData.length,
          competitors_count: userData.competitorData.length,
          recent_activity: userData.recentActivity,
          current_page: context?.current_page
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Genie chatbot error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: "✨ I apologize, but I'm having trouble processing your request right now. Please try again in a moment, or contact support if the issue persists. I'm here to help you optimize your AI visibility! 🚀"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});