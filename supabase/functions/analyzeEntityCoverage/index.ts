import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to extract text content from HTML
function extractTextFromHTML(html: string): string {
  // Remove script and style elements
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, ' ');
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  // Limit to first 1000 characters to stay well within API limits
  return text.substring(0, 1000);
}

// Helper function to extract metadata from HTML
function extractMetadata(html: string): { title: string; description: string; keywords: string } {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  const description = descMatch ? descMatch[1].trim() : '';
  
  const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']*)["']/i);
  const keywords = keywordsMatch ? keywordsMatch[1].trim() : '';
  
  return { title, description, keywords };
}

// Helper function to call Gemini API with very conservative token limit
async function callGeminiAPI(prompt: string): Promise<string> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  
  console.log(`🔑 API Key check: ${apiKey ? `Present (${apiKey.substring(0, 10)}...)` : 'NOT FOUND'}`);
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
  console.log(`🌐 Making request to: ${apiUrl.replace(apiKey, 'HIDDEN_KEY')}`);

  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.1,
      topK: 10,
      topP: 0.5,
      maxOutputTokens: 256, // Very conservative limit to avoid MAX_TOKENS
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_NONE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH", 
        threshold: "BLOCK_NONE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_NONE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_NONE"
      }
    ]
  };

  console.log(`📤 Request body prepared, prompt length: ${prompt.length} characters, maxTokens: 256`);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`📥 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Gemini API error response: ${errorText}`);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Gemini API response received`);
    
    // Enhanced response handling for the specific error case
    let responseText = '';
    
    if (data.candidates && Array.isArray(data.candidates) && data.candidates.length > 0) {
      console.log(`📝 Found candidates array with ${data.candidates.length} items`);
      const candidate = data.candidates[0];
      
      // Check for blocked content or safety issues
      if (candidate.finishReason && candidate.finishReason !== 'STOP') {
        console.warn(`⚠️ Candidate finished with reason: ${candidate.finishReason}`);
        if (candidate.finishReason === 'MAX_TOKENS') {
          throw new Error('Content generation stopped: MAX_TOKENS - Response was too long. Using fallback analysis.');
        } else if (candidate.finishReason === 'SAFETY') {
          throw new Error('Content was blocked by safety filters. Using fallback analysis.');
        } else {
          throw new Error(`Content generation stopped: ${candidate.finishReason}. Using fallback analysis.`);
        }
      }
      
      if (candidate.content && candidate.content.parts && Array.isArray(candidate.content.parts) && candidate.content.parts.length > 0) {
        responseText = candidate.content.parts[0].text;
        console.log(`✅ Successfully extracted text from candidates[0].content.parts[0].text`);
      } else {
        throw new Error('Invalid candidate structure in Gemini API response');
      }
    } else {
      throw new Error('No candidates found in Gemini API response');
    }

    if (!responseText || responseText.trim().length === 0) {
      throw new Error('Empty response text from Gemini API');
    }

    console.log(`📝 Gemini response length: ${responseText.length} characters`);
    console.log(`📝 Response preview: ${responseText.substring(0, 200)}...`);
    
    return responseText;
  } catch (fetchError) {
    console.error(`❌ Fetch error calling Gemini API:`, fetchError);
    throw fetchError;
  }
}

// Helper function to extract and parse JSON from AI response
function extractAndParseJSON(aiResponse: string): any {
  console.log(`🔍 Attempting to extract JSON from AI response: ${aiResponse.substring(0, 200)}...`);
  
  // Clean the response first
  let cleanResponse = aiResponse.trim();
  
  // Try to find JSON content
  const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log(`✅ Successfully parsed JSON`);
      return parsed;
    } catch (parseError) {
      console.warn(`⚠️ JSON parse failed:`, parseError.message);
    }
  }
  
  throw new Error('Could not extract valid JSON from AI response');
}

// Helper function to generate fallback entity analysis
function generateFallbackEntityAnalysis(url: string, content: string, siteId: string): any {
  const domain = new URL(url).hostname;
  const siteName = domain.replace('www.', '').split('.')[0];
  const capitalizedSiteName = siteName.charAt(0).toUpperCase() + siteName.slice(1);
  
  // Analyze content for common business entities
  const contentLower = content.toLowerCase();
  const entities = [];
  
  // Business-related entities with smarter detection
  const businessEntities = [
    { name: capitalizedSiteName, type: 'Organization', importance: 'high', keywords: [siteName.toLowerCase(), capitalizedSiteName.toLowerCase()] },
    { name: 'Professional Services', type: 'Service Category', importance: 'high', keywords: ['service', 'professional', 'solution'] },
    { name: 'Business Solutions', type: 'Service Category', importance: 'medium', keywords: ['business', 'solution', 'enterprise'] },
    { name: 'Customer Support', type: 'Service Feature', importance: 'medium', keywords: ['support', 'customer', 'help'] },
    { name: 'Quality Assurance', type: 'Process', importance: 'medium', keywords: ['quality', 'assurance', 'testing'] },
    { name: 'Project Management', type: 'Service Feature', importance: 'medium', keywords: ['project', 'management', 'planning'] },
    { name: 'Consultation', type: 'Service Type', importance: 'high', keywords: ['consult', 'advice', 'expert'] },
    { name: 'Implementation', type: 'Process', importance: 'medium', keywords: ['implement', 'deploy', 'setup'] }
  ];
  
  // Check which entities are mentioned in the content
  businessEntities.forEach(entity => {
    let mentions = 0;
    
    // Count mentions based on keywords
    entity.keywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = content.match(regex) || [];
      mentions += matches.length;
    });
    
    // Determine if there's a gap based on importance and mention count
    const expectedMentions = entity.importance === 'high' ? 3 : entity.importance === 'medium' ? 2 : 1;
    const gap = mentions < expectedMentions;
    
    entities.push({
      site_id: siteId,
      entity_name: entity.name,
      entity_type: entity.type,
      mention_count: mentions,
      gap: gap,
      created_at: new Date().toISOString()
    });
  });
  
  const entitiesWithGoodCoverage = entities.filter(e => !e.gap);
  const coverageScore = Math.round((entitiesWithGoodCoverage.length / entities.length) * 100);
  
  return {
    entities: entities,
    analysis_summary: `Entity coverage analysis completed for ${capitalizedSiteName}. Found ${entitiesWithGoodCoverage.length} well-covered entities and ${entities.filter(e => e.gap).length} entities with coverage gaps. Focus on improving coverage for high-importance entities to enhance AI understanding.`,
    total_entities: entities.length,
    coverage_score: coverageScore
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 analyzeEntityCoverage function called');
    
    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request body - must be valid JSON',
          details: parseError.message
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { siteId, url, user_id } = requestData;

    // Validate required parameters
    if (!siteId || !url) {
      console.error('❌ Missing required parameters:', { siteId: !!siteId, url: !!url });
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: siteId or url' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`🚀 Starting entity coverage analysis for ${url}`);

    // Fetch the website content
    let websiteContent = '';
    let metadata = { title: '', description: '', keywords: '' };
    
    try {
      console.log(`📡 Fetching website content from ${url}`);
      
      const websiteResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SEOgenix-Bot/1.0; +https://seogenix.com/bot)'
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!websiteResponse.ok) {
        throw new Error(`Failed to fetch website: ${websiteResponse.status} ${websiteResponse.statusText}`);
      }

      const html = await websiteResponse.text();
      console.log(`✅ Successfully fetched ${html.length} characters of HTML`);
      
      // Extract text content and metadata
      websiteContent = extractTextFromHTML(html);
      metadata = extractMetadata(html);
      
      console.log(`📝 Extracted ${websiteContent.length} characters of text content`);
      console.log(`📋 Metadata - Title: "${metadata.title}", Description: "${metadata.description}"`);
      
    } catch (fetchError) {
      console.warn(`⚠️ Failed to fetch website content: ${fetchError.message}`);
      console.log(`🔄 Falling back to URL-based analysis`);
      
      // Fallback: analyze based on URL and domain
      const domain = new URL(url).hostname;
      websiteContent = `Website: ${url}\nDomain: ${domain}\nNote: Content could not be fetched directly.`;
    }

    let analysisResult;
    let analysisMethod = 'Rule-based';

    // Check if Gemini API key is available
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    console.log(`🔑 Environment check - GEMINI_API_KEY: ${apiKey ? 'PRESENT' : 'MISSING'}`);
    
    if (apiKey) {
      try {
        console.log(`🤖 Attempting AI entity analysis with Gemini API`);
        
        // Very minimal prompt to avoid MAX_TOKENS
        const analysisPrompt = `Analyze entities for: ${url}
Content: ${websiteContent.substring(0, 800)}

Return JSON only:
{"entities":[{"entity_name":"Company","entity_type":"Organization","mention_count":5,"gap":false}],"analysis_summary":"Brief analysis","total_entities":5,"coverage_score":80}

Max 5 entities. Keep brief.`;

        console.log(`🤖 Calling Gemini API for entity analysis (minimal prompt: ${analysisPrompt.length} chars)`);
        
        // Call Gemini API to analyze entities
        const aiAnalysis = await callGeminiAPI(analysisPrompt);
        
        console.log(`✅ Gemini API returned analysis: ${aiAnalysis.substring(0, 200)}...`);

        // Parse the AI response to extract entity data
        try {
          const parsedResult = extractAndParseJSON(aiAnalysis);
          console.log(`✅ Successfully parsed AI entity analysis`);
          
          // Add siteId to each entity and ensure proper structure
          if (parsedResult.entities && Array.isArray(parsedResult.entities)) {
            parsedResult.entities = parsedResult.entities.map(entity => ({
              site_id: siteId,
              entity_name: entity.entity_name || 'Unknown Entity',
              entity_type: entity.entity_type || 'Unknown',
              mention_count: entity.mention_count || 0,
              gap: entity.gap !== undefined ? entity.gap : false,
              created_at: new Date().toISOString()
            }));
          } else {
            throw new Error('No entities array found in AI response');
          }
          
          // Ensure we have all required fields
          analysisResult = {
            entities: parsedResult.entities,
            analysis_summary: parsedResult.analysis_summary || 'Entity analysis completed successfully',
            total_entities: parsedResult.total_entities || parsedResult.entities.length,
            coverage_score: parsedResult.coverage_score || 75
          };
          
          analysisMethod = 'AI-powered (Gemini 2.5 Flash Preview)';
        } catch (parseError) {
          console.error('❌ Failed to parse AI entity analysis:', parseError);
          console.log('Raw AI response:', aiAnalysis);
          throw parseError; // This will trigger the fallback below
        }
      } catch (aiError) {
        console.error(`❌ AI entity analysis failed with error:`, aiError);
        console.log(`🔄 Falling back to rule-based entity analysis`);
        
        analysisResult = generateFallbackEntityAnalysis(url, websiteContent, siteId);
        analysisMethod = `Rule-based (AI failed: ${aiError.message.substring(0, 100)})`;
      }
    } else {
      console.log(`⚠️ GEMINI_API_KEY not configured, using rule-based entity analysis`);
      analysisResult = generateFallbackEntityAnalysis(url, websiteContent, siteId);
      analysisMethod = 'Rule-based (API key not configured)';
    }

    console.log(`📊 Generated entity analysis using ${analysisMethod}: ${analysisResult.entities.length} entities found`);

    // Return successful response
    const responseData = {
      entities: analysisResult.entities,
      analysis_summary: analysisResult.analysis_summary,
      total_entities: analysisResult.total_entities,
      coverage_score: analysisResult.coverage_score,
      analysis_method: analysisMethod,
      success: true
    };

    console.log('✅ Returning successful entity analysis response');

    return new Response(
      JSON.stringify(responseData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Error in analyzeEntityCoverage function:', error);
    
    // Return detailed error information
    const errorResponse = {
      error: 'Failed to analyze entity coverage',
      details: error.message,
      type: error.name || 'Unknown Error',
      suggestion: error.message.includes('GEMINI_API_KEY') 
        ? 'Please configure the GEMINI_API_KEY environment variable in your Supabase project settings under Project Settings > Environment Variables.'
        : 'Please check the logs for more details and try again.',
      success: false
    };

    console.log('❌ Returning error response:', errorResponse);

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
})