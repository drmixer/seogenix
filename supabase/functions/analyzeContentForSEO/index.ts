import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to call Gemini API with improved response handling
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
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    }
  };

  console.log(`📤 Request body prepared, prompt length: ${prompt.length} characters`);

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
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('❌ Invalid response structure from Gemini API:', data);
      throw new Error('Invalid response structure from Gemini API');
    }

    const content = data.candidates[0].content.parts[0].text;
    console.log(`📝 Generated content length: ${content.length} characters`);
    
    return content;
  } catch (error) {
    console.error(`❌ Error calling Gemini API:`, error);
    throw error;
  }
}

// Helper function to calculate word count
function getWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Helper function to calculate readability score (simplified Flesch Reading Ease)
function calculateReadabilityScore(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const words = getWordCount(text);
  const syllables = text.toLowerCase().match(/[aeiouy]+/g)?.length || 0;
  
  if (sentences === 0 || words === 0) return 50;
  
  const avgSentenceLength = words / sentences;
  const avgSyllablesPerWord = syllables / words;
  
  // Simplified Flesch Reading Ease formula
  const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  
  // Convert to 0-100 scale where higher is better
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Helper function to analyze entity coverage
function analyzeEntityCoverage(text: string): number {
  const entities = [
    // Business entities
    /\b(company|business|organization|corporation|enterprise|firm|agency)\b/gi,
    // Service entities
    /\b(service|solution|product|offering|platform|system|tool)\b/gi,
    // Technology entities
    /\b(technology|software|application|website|digital|online|cloud)\b/gi,
    // Action entities
    /\b(help|support|provide|deliver|create|develop|manage|optimize)\b/gi,
  ];
  
  let entityCount = 0;
  entities.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) entityCount += matches.length;
  });
  
  const words = getWordCount(text);
  const entityDensity = words > 0 ? (entityCount / words) * 100 : 0;
  
  // Score based on entity density (optimal range: 2-8%)
  if (entityDensity >= 2 && entityDensity <= 8) return 90;
  if (entityDensity >= 1 && entityDensity <= 10) return 70;
  if (entityDensity >= 0.5 && entityDensity <= 12) return 50;
  return 30;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log(`🚀 analyzeContentForSEO function called`);
    
    const { content } = await req.json();
    
    if (!content || typeof content !== 'string') {
      throw new Error('Content is required and must be a string');
    }

    console.log(`📝 Analyzing content with ${content.length} characters`);

    // Calculate basic metrics
    const wordCount = getWordCount(content);
    const readabilityScore = calculateReadabilityScore(content);
    const entityCoverageScore = analyzeEntityCoverage(content);

    console.log(`📊 Basic metrics calculated:`, {
      wordCount,
      readabilityScore,
      entityCoverageScore
    });

    // Create AI analysis prompt
    const analysisPrompt = `
Analyze the following content for AI visibility and optimization. Provide a detailed analysis in JSON format with the following structure:

{
  "score": <overall_score_0_to_100>,
  "ai_optimization_score": <ai_optimization_score_0_to_100>,
  "semantic_clarity_score": <semantic_clarity_score_0_to_100>,
  "recommendations": [
    "specific actionable recommendation 1",
    "specific actionable recommendation 2",
    "specific actionable recommendation 3"
  ],
  "strengths": [
    "strength 1",
    "strength 2"
  ],
  "weaknesses": [
    "weakness 1",
    "weakness 2"
  ],
  "analysis_summary": "Brief summary of the content's AI visibility potential"
}

Content to analyze:
${content}

Focus on:
1. How well the content would be understood by AI systems
2. Clarity and structure for AI processing
3. Entity coverage and semantic completeness
4. Potential for being cited by AI systems
5. Overall optimization for AI visibility

Provide specific, actionable recommendations for improvement.`;

    console.log(`🤖 Calling Gemini API for content analysis...`);
    
    let aiAnalysis;
    try {
      const aiResponse = await callGeminiAPI(analysisPrompt);
      
      // Try to parse JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    } catch (error) {
      console.error('❌ AI analysis failed, using fallback analysis:', error);
      
      // Fallback analysis based on content characteristics
      const hasHeadings = /#{1,6}\s/.test(content) || /<h[1-6]/.test(content);
      const hasLists = /^\s*[-*+]\s/m.test(content) || /<[uo]l/.test(content);
      const hasQuestions = /\?/.test(content);
      const hasStructure = hasHeadings || hasLists;
      
      const baseScore = Math.min(85, Math.max(30, 
        (readabilityScore * 0.3) + 
        (entityCoverageScore * 0.3) + 
        (hasStructure ? 25 : 10) + 
        (hasQuestions ? 15 : 5)
      ));

      aiAnalysis = {
        score: Math.round(baseScore),
        ai_optimization_score: Math.round(baseScore * 0.9),
        semantic_clarity_score: Math.round(readabilityScore * 0.8 + 20),
        recommendations: [
          hasHeadings ? "Consider adding more descriptive headings" : "Add clear headings and subheadings to improve structure",
          hasLists ? "Expand your lists with more detailed explanations" : "Use bullet points and numbered lists to organize information",
          hasQuestions ? "Expand your Q&A sections" : "Add FAQ sections to address common questions",
          "Include more specific examples and use cases",
          "Add authoritative sources and references where appropriate"
        ].slice(0, 3),
        strengths: [
          wordCount > 200 ? "Good content length for comprehensive coverage" : "Concise and focused content",
          readabilityScore > 60 ? "Clear and readable writing style" : "Direct communication style"
        ],
        weaknesses: [
          !hasStructure ? "Lacks clear structural organization" : "Could benefit from more detailed sections",
          entityCoverageScore < 50 ? "Limited entity coverage" : "Could expand on key concepts"
        ],
        analysis_summary: `Content shows ${baseScore > 70 ? 'good' : baseScore > 50 ? 'moderate' : 'basic'} potential for AI visibility with ${hasStructure ? 'decent' : 'limited'} structural organization.`
      };
    }

    // Combine AI analysis with calculated metrics
    const finalAnalysis = {
      ...aiAnalysis,
      word_count: wordCount,
      readability_score: readabilityScore,
      entity_coverage_score: entityCoverageScore,
      // Ensure all required fields exist
      recommendations: aiAnalysis.recommendations || [],
      strengths: aiAnalysis.strengths || [],
      weaknesses: aiAnalysis.weaknesses || [],
      analysis_summary: aiAnalysis.analysis_summary || 'Content analysis completed'
    };

    console.log(`✅ Content analysis completed successfully`);
    console.log(`📊 Final scores:`, {
      overall: finalAnalysis.score,
      ai_optimization: finalAnalysis.ai_optimization_score,
      semantic_clarity: finalAnalysis.semantic_clarity_score,
      readability: finalAnalysis.readability_score,
      entity_coverage: finalAnalysis.entity_coverage_score
    });

    return new Response(
      JSON.stringify(finalAnalysis),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ analyzeContentForSEO error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Content analysis failed. Please try again with different content.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});