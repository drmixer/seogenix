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

// Helper function to get user's site data
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

      // Get entities
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
    }

    return {
      sites: sites || [],
      selectedSite,
      auditData,
      citationData,
      summaryData,
      entityData,
      competitorData
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
      competitorData: []
    };
  }
}

// Helper function to create contextual prompt
function createContextualPrompt(message: string, userData: any, context: any): string {
  const { sites, selectedSite, auditData, citationData, summaryData, entityData, competitorData } = userData;
  
  let contextInfo = `You are an AI assistant for SEOgenix, a platform that helps users optimize their content for AI visibility. You are knowledgeable, helpful, and provide actionable advice.

User Context:
- Total sites: ${sites.length}
- Current page: ${context.current_page || 'unknown'}
`;

  if (selectedSite) {
    contextInfo += `
Selected Site: ${selectedSite.name} (${selectedSite.url})
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
Latest Audit Results:
- Overall Score: ${overallScore}/100
- AI Visibility: ${auditData.ai_visibility_score}/100
- Schema Score: ${auditData.schema_score}/100
- Semantic Score: ${auditData.semantic_score}/100
- Citation Score: ${auditData.citation_score}/100
- Technical SEO: ${auditData.technical_seo_score}/100
- Audit Date: ${new Date(auditData.created_at).toLocaleDateString()}
`;
    }

    if (citationData.length > 0) {
      contextInfo += `
Recent Citations Found: ${citationData.length}
Citation Sources: ${citationData.map(c => c.source_type).join(', ')}
`;
    }

    if (summaryData.length > 0) {
      contextInfo += `
Generated Summaries: ${summaryData.length}
Summary Types: ${summaryData.map(s => s.summary_type).join(', ')}
`;
    }

    if (entityData.length > 0) {
      const entitiesWithGaps = entityData.filter(e => e.gap);
      contextInfo += `
Entity Analysis:
- Total Entities: ${entityData.length}
- Entities with Coverage Gaps: ${entitiesWithGaps.length}
- Top Entities: ${entityData.slice(0, 3).map(e => e.entity_name).join(', ')}
`;
    }

    if (competitorData.length > 0) {
      contextInfo += `
Competitors Being Tracked: ${competitorData.length}
Competitor Names: ${competitorData.map(c => c.name).join(', ')}
`;
    }
  }

  contextInfo += `

Available SEOgenix Features:
- AI Visibility Audit: Comprehensive analysis of AI visibility factors
- Competitive Analysis: Compare performance against competitors
- AI Content Optimizer: Analyze and optimize content for AI systems
- Schema Generator: Create structured data markup
- Citation Tracker: Monitor AI system citations
- Voice Assistant Tester: Test voice assistant responses
- LLM Site Summaries: Generate AI-optimized summaries
- Entity Coverage Analyzer: Identify content gaps
- Prompt Match Suggestions: Generate AI-optimized prompts
- AI Content Generator: Create AI-friendly content

Guidelines for responses:
1. Be helpful and provide actionable advice
2. Reference the user's specific data when relevant
3. Suggest specific SEOgenix features that could help
4. Provide implementation guidance when asked
5. Keep responses concise but comprehensive
6. Use bullet points for lists and recommendations
7. Be encouraging and supportive

User Question: ${message}

Provide a helpful, contextual response based on the user's data and question:`;

  return contextInfo;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log(`🤖 Chatbot function called`);
    
    const { message, user_id, site_id, context } = await req.json();
    
    if (!message || typeof message !== 'string') {
      throw new Error('Message is required and must be a string');
    }

    if (!user_id) {
      throw new Error('User ID is required');
    }

    console.log(`💬 Processing message: "${message.substring(0, 50)}..." for user: ${user_id}`);

    // Get user's site data for context
    const userData = await getUserSiteData(user_id, site_id);
    
    console.log(`📊 User data loaded:`, {
      sites: userData.sites.length,
      selectedSite: userData.selectedSite?.name,
      hasAudit: !!userData.auditData,
      citations: userData.citationData.length,
      summaries: userData.summaryData.length,
      entities: userData.entityData.length,
      competitors: userData.competitorData.length
    });

    // Create contextual prompt
    const prompt = createContextualPrompt(message, userData, context || {});
    
    console.log(`🧠 Calling Gemini API with contextual prompt...`);
    
    // Get AI response
    const aiResponse = await callGeminiAPI(prompt);
    
    console.log(`✅ AI response generated (${aiResponse.length} characters)`);

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
          competitors_count: userData.competitorData.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Chatbot error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment, or contact support if the issue persists."
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});