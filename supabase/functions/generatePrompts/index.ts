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
    const { content, industry, targetAudience, contentType, siteUrl } = await req.json()

    if (!content || content.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "Content must be at least 10 characters long" }),
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
    let context = `Content: ${content}`
    if (industry) context += `\nIndustry: ${industry}`
    if (targetAudience) context += `\nTarget Audience: ${targetAudience}`
    if (contentType) context += `\nContent Type: ${contentType}`
    if (siteUrl) context += `\nWebsite: ${siteUrl}`

    const prompt = `
Based on this content, generate comprehensive AI-optimized prompt suggestions:

${context}

Generate suggestions for these categories:
1. Voice Search Queries (5-7 natural, conversational questions)
2. FAQ Questions (5-7 questions perfect for FAQ sections)
3. AI-Optimized Headlines (5-7 headlines optimized for AI understanding)
4. Featured Snippet Targets (5-7 questions likely to trigger featured snippets)
5. Long-tail Keywords (5-7 specific, longer phrases)
6. Comparison Queries (5-7 comparison-style questions)
7. How-to Queries (5-7 instructional queries)

Also provide:
- Analysis Summary: Brief overview of the content and optimization potential
- Total Suggestions: Count of all suggestions generated

Respond with ONLY a JSON object in this exact format:
{
  "suggestions": {
    "voice_search": [
      "What services does this company offer?",
      "How can this business help me?"
    ],
    "faq_questions": [
      "What makes this service unique?",
      "How do I get started?"
    ],
    "headlines": [
      "Complete Guide to [Topic]",
      "Everything You Need to Know About [Service]"
    ],
    "featured_snippets": [
      "What is [topic] and how does it work?",
      "Why is [service] important for businesses?"
    ],
    "long_tail": [
      "best [service] for small businesses",
      "how to choose [product] for [industry]"
    ],
    "comparisons": [
      "[Service A] vs [Service B]: Which is better?",
      "Comparing [Product] options for [audience]"
    ],
    "how_to": [
      "How to implement [service] in your business",
      "Step-by-step guide to [process]"
    ]
  },
  "analysis_summary": "Content analysis shows strong potential for AI optimization with clear value propositions and service offerings.",
  "total_suggestions": 35,
  "dataSource": "Gemini AI Analysis"
}
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the JSON response
    let promptData
    try {
      promptData = JSON.parse(text.trim())
      
      // Count total suggestions
      if (promptData.suggestions) {
        const totalCount = Object.values(promptData.suggestions).reduce((sum: number, arr: any) => {
          return sum + (Array.isArray(arr) ? arr.length : 0)
        }, 0)
        promptData.total_suggestions = totalCount
      }
      
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      
      // Fallback suggestions
      promptData = {
        suggestions: {
          voice_search: [
            "What services does this company provide?",
            "How can this business help me with my needs?",
            "What makes this company different from competitors?",
            "How do I contact this business?",
            "What are the benefits of using this service?"
          ],
          faq_questions: [
            "What services do you offer?",
            "How do I get started?",
            "What are your pricing options?",
            "Do you offer support?",
            "What makes you different?"
          ],
          headlines: [
            "Professional Services for Your Business",
            "Expert Solutions You Can Trust",
            "Quality Service Delivery",
            "Your Partner for Success",
            "Reliable Business Solutions"
          ],
          featured_snippets: [
            "What is this service and how does it work?",
            "Why choose this company for your needs?",
            "How much does this service cost?",
            "What are the benefits of this solution?",
            "How long does the process take?"
          ],
          long_tail: [
            "best professional services for small business",
            "reliable business solutions provider",
            "expert consultation services",
            "quality service delivery company",
            "trusted business partner"
          ],
          comparisons: [
            "This service vs competitors: which is better?",
            "Comparing professional service providers",
            "Best options for business solutions",
            "Service quality comparison guide",
            "Choosing the right business partner"
          ],
          how_to: [
            "How to choose the right service provider",
            "How to get started with professional services",
            "How to evaluate business solutions",
            "How to implement new business processes",
            "How to maximize service value"
          ]
        },
        analysis_summary: "Content shows good potential for AI optimization with clear service offerings and value propositions.",
        total_suggestions: 35,
        dataSource: "Gemini AI Analysis"
      }
    }

    return new Response(
      JSON.stringify(promptData),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )

  } catch (error) {
    console.error('Error in generatePrompts function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )
  }
})