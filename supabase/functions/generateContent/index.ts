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
    const { topic, contentType, industry, targetAudience, tone, length, siteUrl } = await req.json()

    if (!topic || !contentType) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: topic and contentType" }),
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
        maxOutputTokens: 2048,
      }
    })

    // Build context
    let context = `Topic: ${topic}\nContent Type: ${contentType}`
    if (industry) context += `\nIndustry: ${industry}`
    if (targetAudience) context += `\nTarget Audience: ${targetAudience}`
    if (tone) context += `\nTone: ${tone}`
    if (length) context += `\nLength: ${length}`
    if (siteUrl) context += `\nWebsite: ${siteUrl}`

    const prompt = `
Create AI-optimized content based on these specifications:

${context}

Requirements:
- Optimize for AI systems like ChatGPT, Perplexity, and voice assistants
- Use clear, structured formatting with headings
- Include factual, authoritative information
- Make it citation-worthy and easily understood by AI
- Use natural language that answers common questions
- Structure content for featured snippets and voice search

Generate high-quality content that follows these specifications exactly.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()

    // Calculate word count
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length

    return new Response(
      JSON.stringify({ 
        content,
        wordCount,
        dataSource: "Gemini AI Generated",
        contentType,
        topic
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )

  } catch (error) {
    console.error('Error in generateContent function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )
  }
})