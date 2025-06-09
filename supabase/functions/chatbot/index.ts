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

// Helper function to create contextual prompt with subscription-based personality
function createContextualPrompt(message: string, userData: any, context: any, subscriptionLevel: string): string {
  const { sites, selectedSite, auditData, citationData, summaryData, entityData, competitorData, recentActivity } = userData;
  const isFullFeatured = subscriptionLevel === 'pro' || subscriptionLevel === 'agency';
  const isBasicChatbot = subscriptionLevel === 'core';
  
  let contextInfo = `You are Genie, an intelligent and helpful AI assistant for SEOgenix, a platform that helps users optimize their content for AI visibility.

SUBSCRIPTION LEVEL: ${subscriptionLevel.toUpperCase()}

PERSONALITY AND CAPABILITIES BASED ON SUBSCRIPTION:
`;

  if (isFullFeatured) {
    contextInfo += `
PRO/AGENCY FEATURES - FULL ACCESS:
- You have FULL access to analyze user data and provide detailed insights
- Provide specific, actionable recommendations based on their actual metrics
- Interpret audit results and explain what they mean
- Suggest concrete improvements and optimization strategies
- Analyze trends and performance changes
- Provide proactive alerts about metrics that need attention
- Reference specific scores, citations, and competitive data
- Be analytical and data-driven in your responses

PERSONALITY: Expert analyst who provides deep insights and actionable recommendations
- Use data-driven language: "Based on your audit scores...", "Your citation data shows...", "I recommend focusing on..."
- Reference specific metrics and provide concrete next steps
- Be proactive in identifying opportunities and issues
`;
  } else if (isBasicChatbot) {
    contextInfo += `
CORE PLAN FEATURES - LIMITED ACCESS:
- You can ONLY provide tool guidance and feature explanations
- DO NOT analyze user data or provide specific recommendations
- DO NOT interpret audit scores or suggest improvements
- Focus on HOW TO USE tools, not what the results mean
- Explain what features do and how to navigate the platform
- If asked for analysis or recommendations, politely redirect to upgrade

PERSONALITY: Helpful guide who explains how to use the platform
- Use instructional language: "To use this tool...", "This feature helps you...", "You can find this in..."
- Focus on navigation and feature explanations
- When asked for analysis, suggest upgrading for personalized insights
`;
  }

  contextInfo += `
USER CONTEXT:
- Total sites: ${sites.length}
- Current page: ${context.current_page || 'unknown'}
- Subscription: ${subscriptionLevel}
- Is full featured: ${isFullFeatured}
- Is basic chatbot: ${isBasicChatbot}
`;

  if (selectedSite) {
    contextInfo += `
SELECTED SITE: ${selectedSite.name} (${selectedSite.url})
`;

    if (auditData && isFullFeatured) {
      const overallScore = Math.round((
        auditData.ai_visibility_score +
        auditData.schema_score +
        auditData.semantic_score +
        auditData.citation_score +
        auditData.technical_seo_score
      ) / 5);

      contextInfo += `
LATEST AUDIT RESULTS (FULL ACCESS):
- Overall Score: ${overallScore}/100
- AI Visibility: ${auditData.ai_visibility_score}/100
- Schema Score: ${auditData.schema_score}/100
- Semantic Score: ${auditData.semantic_score}/100
- Citation Score: ${auditData.citation_score}/100
- Technical SEO: ${auditData.technical_seo_score}/100
- Audit Date: ${new Date(auditData.created_at).toLocaleDateString()}
- Audit Age: ${recentActivity?.auditAge || 'unknown'} days old

ANALYSIS INSIGHTS:
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
      const highestArea = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b);
      
      contextInfo += `- PRIORITY AREA: ${lowestArea[0]} (${lowestArea[1]}/100) - needs immediate attention
- STRENGTH: ${highestArea[0]} (${highestArea[1]}/100) - performing well
- OVERALL TREND: ${overallScore >= 70 ? 'Good performance' : overallScore >= 50 ? 'Moderate performance' : 'Needs significant improvement'}
`;

      if (citationData.length > 0) {
        contextInfo += `
CITATIONS ANALYSIS:
- Total Citations: ${citationData.length}
- Citation Sources: ${citationData.map(c => c.source_type).join(', ')}
- Recent Citations: ${recentActivity?.hasRecentCitations ? 'Yes' : 'No'}
- Citation Quality: ${citationData.length >= 5 ? 'Good' : citationData.length >= 2 ? 'Moderate' : 'Low'}
`;
      }

      if (entityData.length > 0) {
        const entitiesWithGaps = entityData.filter(e => e.gap);
        contextInfo += `
ENTITY COVERAGE ANALYSIS:
- Total Entities: ${entityData.length}
- Coverage Gaps: ${entitiesWithGaps.length} entities need attention
- Coverage Quality: ${entitiesWithGaps.length === 0 ? 'Excellent' : entitiesWithGaps.length <= 3 ? 'Good' : 'Needs improvement'}
${entitiesWithGaps.length > 0 ? `- PRIORITY GAPS: ${entitiesWithGaps.slice(0, 3).map(e => e.entity_name).join(', ')}` : ''}
`;
      }

      if (competitorData.length > 0) {
        contextInfo += `
COMPETITIVE CONTEXT:
- Competitors Tracked: ${competitorData.length}
- Competitor Names: ${competitorData.map(c => c.name).join(', ')}
`;
      }
    } else if (auditData && isBasicChatbot) {
      contextInfo += `
AUDIT DATA AVAILABLE (LIMITED ACCESS):
- User has audit data but you can only explain what audits measure, not analyze results
- If asked about scores, explain what each metric means but don't provide specific recommendations
- Direct them to upgrade for detailed analysis
`;
    }
  }

  // Add page-specific context
  const pageContext = getPageSpecificContext(context.current_page, isFullFeatured);
  if (pageContext) {
    contextInfo += `\nCURRENT PAGE CONTEXT: ${pageContext}\n`;
  }

  contextInfo += `
RESPONSE GUIDELINES FOR ${subscriptionLevel.toUpperCase()} PLAN:
`;

  if (isFullFeatured) {
    contextInfo += `
1. **Analyze and recommend** - Use their actual data to provide specific insights
2. **Be data-driven** - Reference specific scores, trends, and metrics
3. **Provide actionable steps** - Give concrete next actions based on their situation
4. **Identify priorities** - Tell them what to focus on first based on their weakest areas
5. **Use their site name** and specific data points in recommendations
6. **Suggest relevant tools** that will help with their specific issues
7. **Be proactive** - Alert them to opportunities and issues they might not see
8. **Format clearly** - Use bold for important points, bullets for action items
`;
  } else if (isBasicChatbot) {
    contextInfo += `
1. **Tool guidance only** - Explain how to use features, not what results mean
2. **No data analysis** - Don't interpret scores or provide improvement suggestions
3. **Educational focus** - Explain what tools do and how to navigate
4. **Redirect for analysis** - If asked for recommendations, suggest upgrading
5. **Be helpful** - Provide clear instructions on using the platform
6. **Encourage upgrade** - Mention Pro benefits when relevant but don't be pushy
`;
  }

  contextInfo += `
USER QUESTION: ${message}

Respond as Genie with the appropriate level of access for their ${subscriptionLevel} subscription:`;

  return contextInfo;
}

// Helper function to get page-specific context
function getPageSpecificContext(currentPage: string, isFullFeatured: boolean): string {
  const baseContexts: { [key: string]: string } = {
    '/dashboard': 'User is viewing their main dashboard with site overview and quick stats',
    '/ai-visibility-audit': 'User is on the AI Visibility Audit page',
    '/competitive-analysis': 'User is analyzing competitors and comparing performance',
    '/ai-content-optimizer': 'User is optimizing content for AI systems',
    '/schema-generator': 'User is working with schema markup and structured data',
    '/citation-tracker': 'User is tracking AI citations and mentions',
    '/voice-assistant-tester': 'User is testing voice assistant responses',
    '/llm-site-summaries': 'User is generating or reviewing LLM-optimized summaries',
    '/entity-coverage-analyzer': 'User is analyzing entity coverage and identifying gaps',
    '/prompt-match-suggestions': 'User is generating AI-optimized prompts',
    '/ai-content-generator': 'User is creating AI-friendly content',
    '/account-settings': 'User is managing their account and subscription settings'
  };

  const baseContext = baseContexts[currentPage] || '';
  
  if (isFullFeatured) {
    return baseContext + ' - provide detailed analysis and specific recommendations';
  } else {
    return baseContext + ' - explain how to use the tools and features';
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log(`✨ Genie chatbot function called`);
    
    const { message, user_id, site_id, subscription_level, context } = await req.json();
    
    if (!message || typeof message !== 'string') {
      throw new Error('Message is required and must be a string');
    }

    if (!user_id) {
      throw new Error('User ID is required');
    }

    const userSubscription = subscription_level || 'free';
    console.log(`💬 Processing message for ${userSubscription} user: "${message.substring(0, 50)}..."`);

    // Check if chatbot is available for this subscription level
    if (userSubscription === 'free') {
      return new Response(
        JSON.stringify({
          error: 'Chatbot not available on free plan',
          response: "✨ Hi! I'm Genie, but I'm only available for Core, Pro, and Agency subscribers. Upgrade to unlock AI guidance and personalized insights! 🚀"
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    // Get user's site data and activity for context
    const userData = await getUserSiteData(user_id, site_id);
    
    console.log(`📊 User data loaded for ${userSubscription} user:`, {
      sites: userData.sites.length,
      selectedSite: userData.selectedSite?.name,
      hasAudit: !!userData.auditData,
      citations: userData.citationData.length,
      summaries: userData.summaryData.length,
      entities: userData.entityData.length,
      competitors: userData.competitorData.length
    });

    // Create contextual prompt with subscription-based personality
    const prompt = createContextualPrompt(message, userData, context || {}, userSubscription);
    
    console.log(`🧠 Calling Gemini API with ${userSubscription} subscription context...`);
    
    // Get AI response
    const aiResponse = await callGeminiAPI(prompt);
    
    console.log(`✅ Genie response generated for ${userSubscription} user (${aiResponse.length} characters)`);

    return new Response(
      JSON.stringify({
        response: aiResponse,
        subscription_level: userSubscription,
        context_used: {
          sites_count: userData.sites.length,
          selected_site: userData.selectedSite?.name,
          has_audit_data: !!userData.auditData,
          citations_count: userData.citationData.length,
          summaries_count: userData.summaryData.length,
          entities_count: userData.entityData.length,
          competitors_count: userData.competitorData.length,
          recent_activity: userData.recentActivity,
          current_page: context?.current_page,
          is_full_featured: userSubscription === 'pro' || userSubscription === 'agency',
          is_basic_chatbot: userSubscription === 'core'
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