import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

// Create comprehensive prompt for landing page chatbot
function createLandingPagePrompt(message: string): string {
  return `You are Genie, a helpful and knowledgeable AI assistant for SEOgenix, a cutting-edge platform that helps businesses optimize their content for AI visibility. You're on the landing page helping potential customers understand the platform.

ABOUT SEOGEMIX:
SEOgenix is the first comprehensive platform designed specifically for the AI era of search. While traditional SEO focuses on Google rankings, SEOgenix helps businesses get found and cited by AI systems like ChatGPT, Perplexity, Claude, voice assistants (Siri, Alexa, Google Assistant), and other AI-powered tools.

KEY PLATFORM FEATURES:
1. **AI Visibility Audit** - Comprehensive analysis of how well content performs with AI systems
2. **Schema Generator** - Creates structured data markup for better AI understanding
3. **Citation Tracker** - Monitors when AI systems cite your content
4. **Voice Assistant Tester** - Tests how voice assistants respond to queries about your content
5. **Entity Coverage Analyzer** - Identifies key entities and ensures comprehensive coverage
6. **AI Content Generator** - Creates AI-optimized content snippets and FAQs
7. **Competitive Analysis** - Tracks competitor AI visibility performance
8. **AI Content Optimizer** - Analyzes and optimizes existing content for AI systems
9. **Prompt Match Suggestions** - Generates AI-optimized prompts and questions
10. **LLM Site Summaries** - Creates comprehensive summaries optimized for AI consumption

PRICING PLANS:

**FREE PLAN ($0/month):**
- 1 Website/Project
- AI Visibility Audit (1/month, basic)
- Schema Generator (basic types only)
- AI Content Generator (3 outputs/month)
- Prompt Match Suggestions (5/month)
- Citation Tracker (top 3 sources, delayed)
- Community Support

**CORE PLAN ($29/month or $261/year):**
- Everything in Free, plus:
- 2 Websites/Projects
- AI Visibility Audit (2/month, full report)
- Full Schema Generator access
- AI Content Generator (20 outputs/month)
- AI Content Optimizer (up to 10 pages/month)
- Prompt Match Suggestions (20/month)
- Citation Tracker (real-time + full sources)
- Entity Coverage Analyzer
- AI Chatbot (basic tool guidance)
- Email Support

**PRO PLAN ($59/month or $531/year) - MOST POPULAR:**
- Everything in Core, plus:
- 5 Websites/Projects
- Weekly AI Visibility Audits
- LLM Site Summaries
- Voice Assistant Tester (unlimited)
- AI Content Generator (60 outputs/month)
- AI Content Optimizer (30 pages/month)
- Prompt Match Suggestions (60/month)
- Competitive Analysis (3 competitors)
- AI Chatbot (full analysis and recommendations)
- Priority Support

**AGENCY PLAN ($99/month or $891/year):**
- Everything in Pro, plus:
- 10 Websites/Projects
- Daily AI Visibility Audits
- Unlimited AI Content Generator & Optimizer
- Unlimited Prompt Match Suggestions
- Competitive Analysis (10 competitors)
- Exportable Reports (PDF/CSV)
- Team Collaboration (up to 5 members)
- Early Access to New Features
- Dedicated Support & Onboarding

WHY AI VISIBILITY MATTERS:
- AI systems are becoming the primary way people find information
- Traditional SEO doesn't optimize for AI understanding and citations
- Voice search and AI assistants are growing rapidly
- Being cited by AI systems drives high-quality, targeted traffic
- AI-optimized content performs better across all search channels

UNIQUE VALUE PROPOSITIONS:
- First platform specifically designed for AI visibility optimization
- Comprehensive suite of tools in one platform
- Real-time citation tracking across multiple AI systems
- Actionable insights and recommendations
- Suitable for businesses of all sizes
- No technical expertise required

PERSONALITY GUIDELINES:
- Be enthusiastic but not pushy about the platform
- Focus on education and helping users understand AI visibility
- Provide specific, actionable information
- Use examples when helpful
- Be conversational and approachable
- Always offer to help with next steps
- Emphasize the free plan as a great starting point

USER QUESTION: ${message}

Respond as Genie, the helpful SEOgenix assistant. Be informative, engaging, and focus on how SEOgenix can solve their AI visibility challenges. Use formatting like **bold** for emphasis when helpful.`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log(`✨ Landing page Genie chatbot called`);
    
    const { message } = await req.json();
    
    if (!message || typeof message !== 'string') {
      throw new Error('Message is required and must be a string');
    }

    console.log(`💬 Processing landing page message: "${message.substring(0, 50)}..."`);

    // Create contextual prompt for landing page
    const prompt = createLandingPagePrompt(message);
    
    console.log(`🧠 Calling Gemini API for landing page response...`);
    
    // Get AI response
    const aiResponse = await callGeminiAPI(prompt);
    
    console.log(`✅ Landing page Genie response generated (${aiResponse.length} characters)`);

    return new Response(
      JSON.stringify({
        response: aiResponse,
        context: 'landing_page',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Landing page Genie error:', error);
    
    // Provide a helpful fallback response
    const fallbackResponse = `✨ Hi! I'm Genie, your AI assistant for SEOgenix. I'm here to help you understand how our platform can boost your content's visibility to AI systems like ChatGPT and voice assistants.

**What is SEOgenix?**
We're the first comprehensive platform designed specifically for AI visibility optimization. While traditional SEO focuses on Google rankings, we help you get found and cited by AI systems.

**Key Features:**
• AI Visibility Audits
• Schema Generation
• Citation Tracking
• Voice Assistant Testing
• Content Optimization

**Getting Started:**
Start with our free plan (no credit card required) and upgrade as you grow. Would you like to know more about our features or pricing?`;
    
    return new Response(
      JSON.stringify({ 
        response: fallbackResponse,
        context: 'landing_page_fallback',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});