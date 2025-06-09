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
    const { url, schemaType } = await req.json()

    if (!url || !schemaType) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: url and schemaType" }),
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
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    })

    // Fetch website content for context
    let websiteContent = ''
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SEOgenix-Bot/1.0 (Schema Generator)'
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
          .substring(0, 3000) // Limit content length
      }
    } catch (error) {
      console.error('Error fetching website:', error)
      websiteContent = 'Unable to fetch website content'
    }

    const prompt = `
Generate valid Schema.org JSON-LD markup for this website:

URL: ${url}
Schema Type: ${schemaType}
Website Content: ${websiteContent}

Create proper ${schemaType} schema markup that:
1. Follows Schema.org standards exactly
2. Is valid JSON-LD format
3. Includes relevant properties for the schema type
4. Uses information from the website content when available
5. Includes proper @context and @type declarations

Respond with ONLY the JSON-LD schema markup, no additional text or explanation.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    let schema = response.text().trim()

    // Clean up the response to ensure it's valid JSON
    if (schema.startsWith('```json')) {
      schema = schema.replace(/```json\n?/, '').replace(/\n?```$/, '')
    } else if (schema.startsWith('```')) {
      schema = schema.replace(/```\n?/, '').replace(/\n?```$/, '')
    }

    // Validate JSON
    try {
      JSON.parse(schema)
    } catch (parseError) {
      console.error('Generated schema is not valid JSON:', parseError)
      
      // Fallback schema based on type
      const fallbackSchemas = {
        'Organization': {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Organization Name",
          "url": url,
          "description": "Professional organization providing quality services"
        },
        'LocalBusiness': {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Local Business",
          "url": url,
          "description": "Local business serving the community"
        },
        'Article': {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "Article Title",
          "url": url,
          "description": "Informative article content"
        },
        'FAQ': {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Frequently Asked Question",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Answer to the frequently asked question"
              }
            }
          ]
        },
        'Product': {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Product Name",
          "description": "Product description",
          "url": url
        },
        'HowTo': {
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "How To Guide",
          "description": "Step by step instructions",
          "step": [
            {
              "@type": "HowToStep",
              "text": "Step 1: Follow the instructions"
            }
          ]
        },
        'Event': {
          "@context": "https://schema.org",
          "@type": "Event",
          "name": "Event Name",
          "description": "Event description",
          "url": url
        }
      }
      
      schema = JSON.stringify(fallbackSchemas[schemaType] || fallbackSchemas['Organization'], null, 2)
    }

    return new Response(
      JSON.stringify({ schema }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )

  } catch (error) {
    console.error('Error in generateSchema function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )
  }
})