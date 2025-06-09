import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.21.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { message, user_id, site_id, subscription_level, context } = await req.json()

    if (!message || !user_id) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: message and user_id" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_AI_API_KEY') || '')
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    })

    // Determine chatbot capabilities based on subscription
    const isFullFeatured = subscription_level === 'pro' || subscription_level === 'agency'
    const isBasicChatbot = subscription_level === 'core'

    let systemPrompt = ''
    
    if (isFullFeatured) {
      systemPrompt = `You are Genie, an AI assistant for SEOgenix, a platform that helps optimize content for AI visibility. You have full access to user data and can provide detailed, personalized insights and recommendations.

Your capabilities include:
- Analyzing AI Visibility Scores and providing specific improvement recommendations
- Interpreting audit results and competitive data
- Suggesting optimization strategies tailored to the user's content
- Providing proactive alerts when metrics need attention
- Offering detailed insights about performance trends

User context:
- Subscription: ${subscription_level}
- Site ID: ${site_id || 'Not specified'}
- Current page: ${context?.current_page || 'Unknown'}

Be helpful, insightful, and provide actionable recommendations. You can analyze data and provide specific suggestions for improvement.`
    } else if (isBasicChatbot) {
      systemPrompt = `You are Genie, an AI assistant for SEOgenix. On the Core plan, you provide tool guidance and explanations but cannot access user data for personalized analysis.

Your capabilities include:
- Explaining how to use SEOgenix tools and features
- Providing general guidance on AI visibility optimization
- Helping users navigate the platform
- Answering questions about what different metrics mean

You CANNOT:
- Analyze specific user data or scores
- Provide personalized recommendations based on user metrics
- Access audit results or performance data

User context:
- Subscription: ${subscription_level}
- Current page: ${context?.current_page || 'Unknown'}

Be helpful with tool guidance while encouraging users to upgrade to Pro for personalized insights.`
    } else {
      return new Response(
        JSON.stringify({ error: "Chatbot access requires Core plan or higher" }),
        { 
          status: 403, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    const prompt = `${systemPrompt}

User message: ${message}

Respond helpfully and conversationally. Keep responses concise but informative.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const botResponse = response.text()

    return new Response(
      JSON.stringify({ 
        response: botResponse,
        subscription_level,
        capabilities: isFullFeatured ? 'full' : 'basic'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )

  } catch (error) {
    console.error('Error in chatbot function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )
  }
})