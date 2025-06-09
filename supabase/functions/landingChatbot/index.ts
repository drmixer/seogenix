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
    const { message } = await req.json()

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: message" }),
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

    const systemPrompt = `You are Genie, an AI assistant for SEOgenix, a comprehensive platform for AI visibility optimization. You help potential customers understand how SEOgenix can boost their content's visibility to AI systems like ChatGPT, Perplexity, Claude, Gemini, and voice assistants.

Key information about SEOgenix:
- Helps optimize content for AI systems and voice assistants
- Offers AI visibility audits, schema generation, citation tracking
- Provides competitive analysis and content optimization tools
- Has plans: Free (basic features), Core ($29/month), Pro ($59/month), Agency ($99/month)
- Features include AI audits, schema generators, citation tracking, voice assistant testing
- Helps with featured snippets, AI citations, and voice search optimization

Be helpful, informative, and encouraging about how SEOgenix can help with AI visibility. Keep responses conversational and focused on benefits.`

    const prompt = `${systemPrompt}

User message: ${message}

Respond helpfully about SEOgenix and AI visibility optimization. Be conversational and focus on how the platform can help.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const botResponse = response.text()

    return new Response(
      JSON.stringify({ 
        response: botResponse
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )

  } catch (error) {
    console.error('Error in landingChatbot function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )
  }
})