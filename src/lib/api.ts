import supabase from './supabaseClient';

// Types
export interface Site {
  id: string;
  user_id: string;
  url: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CompetitorSite {
  id: string;
  user_id: string;
  site_id: string;
  url: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Audit {
  id: string;
  site_id: string;
  ai_visibility_score: number;
  schema_score: number;
  semantic_score: number;
  citation_score: number;
  technical_seo_score: number;
  created_at: string;
}

export interface CompetitorAudit {
  id: string;
  competitor_site_id: string;
  ai_visibility_score: number;
  schema_score: number;
  semantic_score: number;
  citation_score: number;
  technical_seo_score: number;
  created_at: string;
}

export interface Citation {
  id: string;
  site_id: string;
  source_type: string;
  snippet_text: string;
  url: string;
  detected_at: string;
}

export interface Summary {
  id: string;
  site_id: string;
  summary_type: string;
  content: string;
  created_at: string;
}

export interface Schema {
  id: string;
  audit_id: string;
  schema_type: string;
  markup: string;
  created_at: string;
}

export interface Entity {
  id: string;
  site_id: string;
  entity_name: string;
  entity_type: string;
  mention_count: number;
  gap: boolean;
  created_at: string;
}

// Site API
export const siteApi = {
  async getSites(): Promise<Site[]> {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getSite(id: string): Promise<Site> {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async addSite(userId: string, url: string, name: string): Promise<Site> {
    const { data, error } = await supabase
      .from('sites')
      .insert([{ url, name, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createSite(url: string, name: string): Promise<Site> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('sites')
      .insert([{ url, name, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSite(id: string): Promise<void> {
    const { error } = await supabase
      .from('sites')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Competitor API
export const competitorApi = {
  async getCompetitorSites(userId: string): Promise<CompetitorSite[]> {
    const { data, error } = await supabase
      .from('competitor_sites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addCompetitorSite(userId: string, url: string, name: string, userSiteId: string): Promise<CompetitorSite> {
    const { data, error } = await supabase
      .from('competitor_sites')
      .insert([{ 
        user_id: userId, 
        site_id: userSiteId, 
        url, 
        name 
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCompetitorSite(id: string): Promise<void> {
    const { error } = await supabase
      .from('competitor_sites')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async runCompetitorAnalysis(competitorSiteId: string, competitorUrl: string): Promise<CompetitorAudit> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('🚀 Calling analyzeCompetitorSite edge function with:', { competitorSiteId, competitorUrl });

      // Call the analyzeCompetitorSite edge function
      const { data, error } = await supabase.functions.invoke('analyzeCompetitorSite', {
        body: { competitorSiteId, url: competitorUrl, user_id: user.id }
      });

      console.log('📥 analyzeCompetitorSite response:', { data, error });

      if (error) {
        console.error('❌ analyzeCompetitorSite edge function error:', error);
        throw new Error(`Edge function failed: ${error.message || 'Unknown error'}`);
      }

      if (!data) {
        throw new Error('No data returned from analyzeCompetitorSite edge function');
      }

      if (data.error) {
        console.error('❌ analyzeCompetitorSite returned error:', data.error);
        throw new Error(`Competitor analysis failed: ${data.error}`);
      }

      console.log('✅ analyzeCompetitorSite completed successfully');

      // Save the audit to the database
      const { data: savedAudit, error: dbError } = await supabase
        .from('competitor_audits')
        .insert([data.audit])
        .select()
        .single();

      if (dbError) {
        console.error('❌ Database error saving competitor audit:', dbError);
        throw new Error(`Failed to save competitor audit: ${dbError.message}`);
      }

      console.log('✅ Competitor audit saved to database:', savedAudit);

      return savedAudit;
    } catch (error) {
      console.error('❌ Error running competitor analysis:', error);
      throw error;
    }
  },

  async getCompetitorAudits(competitorSiteId: string): Promise<CompetitorAudit[]> {
    const { data, error } = await supabase
      .from('competitor_audits')
      .select('*')
      .eq('competitor_site_id', competitorSiteId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

// Summary API
export const summaryApi = {
  async getSummaries(siteId: string): Promise<Summary[]> {
    const { data, error } = await supabase
      .from('summaries')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async generateSummary(siteId: string, url: string, summaryType: string): Promise<{
    summary: Summary;
    dataSource: string;
    wordCount: number;
  }> {
    try {
      console.log('🚀 Calling generateSummary edge function with:', { siteId, url, summaryType });
      
      // Validate inputs before making the call
      if (!siteId || !url || !summaryType) {
        throw new Error('Missing required parameters: siteId, url, or summaryType');
      }

      // Prepare the request body
      const requestBody = {
        siteId: siteId.trim(),
        url: url.trim(),
        summaryType: summaryType.trim()
      };

      console.log('📤 Request body:', requestBody);

      // Call the edge function - removed headers to prevent JSON serialization conflicts
      const { data, error } = await supabase.functions.invoke('generateSummary', {
        body: requestBody
      });

      console.log('📥 Edge function response:', { data, error });

      if (error) {
        console.error('❌ Edge function error:', error);
        
        // Try to extract more detailed error information
        let errorMessage = 'Edge function failed';
        if (error.message) {
          errorMessage += `: ${error.message}`;
        }
        if (error.details) {
          errorMessage += ` (${error.details})`;
        }
        if (error.hint) {
          errorMessage += ` - ${error.hint}`;
        }
        
        throw new Error(errorMessage);
      }

      if (!data) {
        throw new Error('No data returned from edge function');
      }

      // Check if the Edge Function returned an error in the response data
      if (data.error) {
        console.error('❌ Edge function returned error:', data.error);
        let errorMessage = `Edge function failed: ${data.error}`;
        if (data.details) {
          errorMessage += ` - ${data.details}`;
        }
        throw new Error(errorMessage);
      }

      console.log('✅ Edge function response:', data);

      // Validate the response structure
      if (!data.summary) {
        throw new Error('Invalid response: missing summary data');
      }

      // Save the summary to the database
      const { data: savedSummary, error: dbError } = await supabase
        .from('summaries')
        .insert([data.summary])
        .select()
        .single();

      if (dbError) {
        console.error('❌ Database error:', dbError);
        throw new Error(`Failed to save summary: ${dbError.message}`);
      }

      return {
        summary: savedSummary,
        dataSource: data.dataSource || 'Generated',
        wordCount: data.wordCount || 0
      };

    } catch (error) {
      console.error('❌ Summary generation failed:', error);
      throw error;
    }
  }
};

// Audit API
export const auditApi = {
  async getAudits(siteId: string): Promise<Audit[]> {
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getLatestAudit(siteId: string): Promise<Audit | null> {
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async runAudit(siteId: string, url: string): Promise<{ audit: Audit; schemas?: Schema[] }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('🚀 Calling analyzeSite edge function with:', { siteId, url, user_id: user.id });

      // Call the analyzeSite edge function
      const { data, error } = await supabase.functions.invoke('analyzeSite', {
        body: { siteId, url, user_id: user.id }
      });

      console.log('📥 analyzeSite response:', { data, error });

      if (error) {
        console.error('❌ analyzeSite edge function error:', error);
        throw new Error(`Edge function failed: ${error.message || 'Unknown error'}`);
      }

      if (!data) {
        throw new Error('No data returned from analyzeSite edge function');
      }

      if (data.error) {
        console.error('❌ analyzeSite returned error:', data.error);
        throw new Error(`Analysis failed: ${data.error}`);
      }

      if (!data.audit) {
        throw new Error('Invalid response: missing audit data');
      }

      console.log('✅ analyzeSite completed successfully');

      // Save the audit to the database
      const { data: savedAudit, error: dbError } = await supabase
        .from('audits')
        .insert([data.audit])
        .select()
        .single();

      if (dbError) {
        console.error('❌ Database error saving audit:', dbError);
        throw new Error(`Failed to save audit: ${dbError.message}`);
      }

      console.log('✅ Audit saved to database:', savedAudit);

      return { audit: savedAudit };
    } catch (error) {
      console.error('❌ Error running audit:', error);
      throw error;
    }
  },

  async createAudit(siteId: string, url: string): Promise<Audit> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('analyzeSite', {
        body: { siteId, url, user_id: user.id }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating audit:', error);
      throw error;
    }
  }
};

// Citation API
export const citationApi = {
  async getCitations(siteId: string): Promise<Citation[]> {
    const { data, error } = await supabase
      .from('citations')
      .select('*')
      .eq('site_id', siteId)
      .order('detected_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async trackCitations(siteId: string, url: string): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('🚀 Calling trackCitations edge function with:', { siteId, url });

      // Call the trackCitations edge function
      const { data, error } = await supabase.functions.invoke('trackCitations', {
        body: { siteId, url, user_id: user.id }
      });

      console.log('📥 trackCitations response:', { data, error });

      if (error) {
        console.error('❌ trackCitations edge function error:', error);
        throw new Error(`Edge function failed: ${error.message || 'Unknown error'}`);
      }

      if (!data) {
        throw new Error('No data returned from trackCitations edge function');
      }

      if (data.error) {
        console.error('❌ trackCitations returned error:', data.error);
        throw new Error(`Citation tracking failed: ${data.error}`);
      }

      console.log('✅ trackCitations completed successfully');

      // Save citations to database if any were found
      if (data.citations && data.citations.length > 0) {
        const { data: savedCitations, error: citationError } = await supabase
          .from('citations')
          .insert(data.citations)
          .select();

        if (citationError) {
          console.error('❌ Database error saving citations:', citationError);
          // Don't throw here, just log the error
        } else {
          console.log('✅ Citations saved to database:', savedCitations);
          data.citations = savedCitations;
        }
      }

      return data;
    } catch (error) {
      console.error('❌ Error tracking citations:', error);
      throw error;
    }
  }
};

// Schema API
export const schemaApi = {
  async getSchemas(auditId: string): Promise<Schema[]> {
    const { data, error } = await supabase
      .from('schemas')
      .select('*')
      .eq('audit_id', auditId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async generateSchema(url: string, schemaType: string): Promise<{ schema: string }> {
    try {
      console.log('🚀 Calling generateSchema edge function with:', { url, schemaType });
      
      // Validate inputs before making the call
      if (!url || !schemaType) {
        throw new Error('Missing required parameters: url or schemaType');
      }

      // Call the generateSchema edge function
      const { data, error } = await supabase.functions.invoke('generateSchema', {
        body: { url: url.trim(), schemaType: schemaType.trim() }
      });

      console.log('📥 generateSchema response:', { data, error });

      if (error) {
        console.error('❌ generateSchema edge function error:', error);
        throw new Error(`Edge function failed: ${error.message || 'Unknown error'}`);
      }

      if (!data) {
        throw new Error('No data returned from generateSchema edge function');
      }

      if (data.error) {
        console.error('❌ generateSchema returned error:', data.error);
        throw new Error(`Schema generation failed: ${data.error}`);
      }

      console.log('✅ generateSchema completed successfully');

      return { schema: data.schema };
    } catch (error) {
      console.error('❌ Error generating schema:', error);
      throw error;
    }
  }
};

// Entity API
export const entityApi = {
  async getEntities(siteId: string): Promise<Entity[]> {
    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .eq('site_id', siteId)
      .order('mention_count', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async analyzeEntityCoverage(siteId: string, url: string): Promise<{ 
    entities: Entity[]; 
    analysis_summary: string;
    total_entities: number;
    coverage_score: number;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('🚀 Calling analyzeEntityCoverage edge function with:', { siteId, url });

      // Call the analyzeEntityCoverage edge function
      const { data, error } = await supabase.functions.invoke('analyzeEntityCoverage', {
        body: { siteId, url, user_id: user.id }
      });

      console.log('📥 analyzeEntityCoverage response:', { data, error });

      if (error) {
        console.error('❌ analyzeEntityCoverage edge function error:', error);
        throw new Error(`Edge function failed: ${error.message || 'Unknown error'}`);
      }

      if (!data) {
        throw new Error('No data returned from analyzeEntityCoverage edge function');
      }

      if (data.error) {
        console.error('❌ analyzeEntityCoverage returned error:', data.error);
        throw new Error(`Entity analysis failed: ${data.error}`);
      }

      console.log('✅ analyzeEntityCoverage completed successfully');

      // Save entities to database if any were found
      if (data.entities && data.entities.length > 0) {
        const { data: savedEntities, error: entityError } = await supabase
          .from('entities')
          .insert(data.entities)
          .select();

        if (entityError) {
          console.error('❌ Database error saving entities:', entityError);
          // Don't throw here, just log the error and use the original entities
        } else {
          console.log('✅ Entities saved to database:', savedEntities);
          data.entities = savedEntities;
        }
      }

      return {
        entities: data.entities || [],
        analysis_summary: data.analysis_summary || 'Entity analysis completed',
        total_entities: data.total_entities || 0,
        coverage_score: data.coverage_score || 0
      };
    } catch (error) {
      console.error('❌ Error analyzing entity coverage:', error);
      throw error;
    }
  }
};

// Content API
export const contentApi = {
  async generateContent(topic: string, contentType: string, industry?: string, targetAudience?: string, tone?: string, length?: string, siteUrl?: string): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('generateContent', {
        body: { topic, contentType, industry, targetAudience, tone, length, siteUrl }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  },

  async analyzeContent(content: string): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('🚀 Calling analyzeContentForSEO edge function with content length:', content.length);

      const { data, error } = await supabase.functions.invoke('analyzeContentForSEO', {
        body: { content }
      });

      console.log('📥 analyzeContentForSEO response:', { data, error });

      if (error) {
        console.error('❌ analyzeContentForSEO edge function error:', error);
        throw new Error(`Edge function failed: ${error.message || 'Unknown error'}`);
      }

      if (!data) {
        throw new Error('No data returned from analyzeContentForSEO edge function');
      }

      if (data.error) {
        console.error('❌ analyzeContentForSEO returned error:', data.error);
        throw new Error(`Content analysis failed: ${data.error}`);
      }

      console.log('✅ analyzeContentForSEO completed successfully');

      return data;
    } catch (error) {
      console.error('❌ Error analyzing content:', error);
      throw error;
    }
  }
};

// Prompt API
export const promptApi = {
  async generatePrompts(content: string, industry?: string, targetAudience?: string, contentType?: string, siteUrl?: string): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('generatePrompts', {
        body: { content, industry, targetAudience, contentType, siteUrl }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating prompts:', error);
      throw error;
    }
  }
};

// Chatbot API
export const chatbotApi = {
  async sendMessage(message: string, siteId?: string, context?: any): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('🤖 Calling chatbot edge function with message:', message.substring(0, 50) + '...');

      const { data, error } = await supabase.functions.invoke('chatbot', {
        body: { 
          message, 
          user_id: user.id, 
          site_id: siteId,
          context 
        }
      });

      console.log('📥 Chatbot response:', { data, error });

      if (error) {
        console.error('❌ Chatbot edge function error:', error);
        throw new Error(`Chatbot failed: ${error.message || 'Unknown error'}`);
      }

      if (!data) {
        throw new Error('No data returned from chatbot edge function');
      }

      if (data.error) {
        console.error('❌ Chatbot returned error:', data.error);
        throw new Error(`Chatbot failed: ${data.error}`);
      }

      console.log('✅ Chatbot response received successfully');

      return data;
    } catch (error) {
      console.error('❌ Error sending message to chatbot:', error);
      throw error;
    }
  }
};