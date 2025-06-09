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
    const { siteId, url, summaryType } = await req.json()

    if (!siteId || !url || !summaryType) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: siteId, url, and summaryType" }),
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
        temperature: 0.4,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    })

    // Fetch website content
    let websiteContent = ''
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SEOgenix-Bot/1.0 (Summary Generator)'
        }
      })
      
      if (response.ok) {
        const html = await response.text()
        // Extract text content from HTML (simplified)
        websiteContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 8000) // Limit content length
      }
    } catch (error) {
      console.error('Error fetching website:', error)
      websiteContent = 'Unable to fetch website content'
    }

    // Define summary type prompts
    const summaryPrompts = {
      'SiteOverview': 'Create a comprehensive overview of this website and business, including purpose, services, and key information.',
      'CompanyProfile': 'Generate a professional company profile highlighting background, mission, and core competencies.',
      'ServiceOfferings': 'Provide a detailed breakdown of all services and offerings provided by this organization.',
      'ProductCatalog': 'Create a structured summary of products and services offered.',
      'AIReadiness': 'Assess and summarize the website\'s optimization for AI systems and voice assistants.',
      'PageSummary': 'Generate a detailed summary of the main page content and purpose.',
      'TechnicalSpecs': 'Summarize technical features, capabilities, and specifications.'
    }

    const summaryPrompt = summaryPrompts[summaryType] || summaryPrompts['SiteOverview']

    const prompt = `
${summaryPrompt}

Website URL: ${url}
Website Content: ${websiteContent}

Create a comprehensive, AI-optimized summary that:
1. Is well-structured with clear headings
2. Includes factual, authoritative information
3. Is optimized for AI understanding and citations
4. Uses natural language that answers common questions
5. Is between 300-800 words
6. Includes relevant entities and key concepts
7. Is formatted for easy reading by both humans and AI systems

Generate a professional summary that would be perfect for AI systems to understand and cite.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()

    // Calculate word count
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length

    // Create summary record
    const summary = {
      site_id: siteId,
      summary_type: summaryType,
      content: content,
      created_at: new Date().toISOString()
    }

    return new Response(
      JSON.stringify({ 
        summary,
        dataSource: "Gemini AI Generated",
        wordCount
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )

  } catch (error) {
    console.error('Error in generateSummary function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )
  }
})