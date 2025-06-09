import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import supabase from '../lib/supabaseClient';

export type PlanTier = 'free' | 'core' | 'pro' | 'agency';

interface Plan {
  name: PlanTier;
  price: number;
  yearlyPrice: number;
  limits: {
    sites: number;
    competitors: number;
    auditFrequency: 'monthly' | 'weekly' | 'daily';
    auditsPerMonth: number;
    aiContentGenerations: number;
    aiContentOptimizations: number;
    promptSuggestions: number;
    citationTracking: 'delayed' | 'realtime' | 'full';
    citationsPerMonth: number;
    features: {
      schemaGeneration: 'basic' | 'full' | 'unlimited';
      entityAnalysis: boolean;
      voiceAssistant: boolean;
      llmSummaries: boolean;
      competitiveAnalysis: boolean;
      contentOptimizer: boolean;
      exportReports: boolean;
      teamCollaboration: boolean;
      prioritySupport: boolean;
      dedicatedSupport: boolean;
      earlyAccess: boolean;
      chatbotAccess: 'none' | 'basic' | 'full';
    };
  };
}

interface Usage {
  citationsUsed: number;
  aiContentUsed: number;
  aiContentOptimizations: number;
  promptSuggestions: number;
  auditsThisMonth: number;
  lastAuditDate: Date | null;
}

interface SubscriptionContextType {
  currentPlan: Plan | null;
  usage: Usage;
  isFeatureEnabled: (feature: keyof Plan['limits']['features']) => boolean;
  getSiteLimit: () => number;
  getCompetitorSiteLimit: () => number;
  getAuditFrequency: () => string;
  canRunAudit: () => boolean;
  canGenerateContent: () => boolean;
  canOptimizeContent: () => boolean;
  canGeneratePrompts: () => boolean;
  canTrackCitations: () => boolean;
  canTrackMoreCitations: () => boolean;
  getChatbotAccess: () => 'none' | 'basic' | 'full';
  loading: boolean;
}

const plans: Record<PlanTier, Plan> = {
  free: {
    name: 'free',
    price: 0,
    yearlyPrice: 0,
    limits: {
      sites: 1,
      competitors: 0,
      auditFrequency: 'monthly',
      auditsPerMonth: 1,
      aiContentGenerations: 3,
      aiContentOptimizations: 0,
      promptSuggestions: 5,
      citationTracking: 'delayed',
      citationsPerMonth: 10,
      features: {
        schemaGeneration: 'basic',
        entityAnalysis: false,
        voiceAssistant: false,
        llmSummaries: false,
        competitiveAnalysis: false,
        contentOptimizer: false,
        exportReports: false,
        teamCollaboration: false,
        prioritySupport: false,
        dedicatedSupport: false,
        earlyAccess: false,
        chatbotAccess: 'none',
      },
    },
  },
  core: {
    name: 'core',
    price: 29,
    yearlyPrice: 261, // 25% discount
    limits: {
      sites: 2,
      competitors: 0,
      auditFrequency: 'monthly',
      auditsPerMonth: 2,
      aiContentGenerations: 20,
      aiContentOptimizations: 10,
      promptSuggestions: 20,
      citationTracking: 'realtime',
      citationsPerMonth: 50,
      features: {
        schemaGeneration: 'full',
        entityAnalysis: true,
        voiceAssistant: false,
        llmSummaries: false,
        competitiveAnalysis: false,
        contentOptimizer: true,
        exportReports: false,
        teamCollaboration: false,
        prioritySupport: false,
        dedicatedSupport: false,
        earlyAccess: false,
        chatbotAccess: 'basic',
      },
    },
  },
  pro: {
    name: 'pro',
    price: 59,
    yearlyPrice: 531, // 25% discount
    limits: {
      sites: 5,
      competitors: 3,
      auditFrequency: 'weekly',
      auditsPerMonth: 8,
      aiContentGenerations: 60,
      aiContentOptimizations: 30,
      promptSuggestions: 60,
      citationTracking: 'full',
      citationsPerMonth: 200,
      features: {
        schemaGeneration: 'full',
        entityAnalysis: true,
        voiceAssistant: true,
        llmSummaries: true,
        competitiveAnalysis: true,
        contentOptimizer: true,
        exportReports: false,
        teamCollaboration: false,
        prioritySupport: true,
        dedicatedSupport: false,
        earlyAccess: false,
        chatbotAccess: 'full',
      },
    },
  },
  agency: {
    name: 'agency',
    price: 99,
    yearlyPrice: 891, // 25% discount
    limits: {
      sites: 10,
      competitors: 10,
      auditFrequency: 'daily',
      auditsPerMonth: Infinity,
      aiContentGenerations: Infinity,
      aiContentOptimizations: Infinity,
      promptSuggestions: Infinity,
      citationTracking: 'full',
      citationsPerMonth: Infinity,
      features: {
        schemaGeneration: 'unlimited',
        entityAnalysis: true,
        voiceAssistant: true,
        llmSummaries: true,
        competitiveAnalysis: true,
        contentOptimizer: true,
        exportReports: true,
        teamCollaboration: true,
        prioritySupport: true,
        dedicatedSupport: true,
        earlyAccess: true,
        chatbotAccess: 'full',
      },
    },
  },
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Helper function to check if Supabase is properly configured
const isSupabaseConfigured = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  return supabaseUrl && 
         supabaseAnonKey && 
         supabaseUrl !== 'your-supabase-url' && 
         supabaseAnonKey !== 'your-supabase-anon-key' &&
         supabaseUrl !== '' &&
         supabaseAnonKey !== '' &&
         supabaseUrl.startsWith('http') &&
         supabaseAnonKey.length > 20;
};

// Helper function to safely make Supabase calls with timeout and error handling
const safeSupabaseCall = async (operation: () => Promise<any>, timeoutMs: number = 10000) => {
  return Promise.race([
    operation(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
};

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [usage, setUsage] = useState<Usage>({
    citationsUsed: 0,
    aiContentUsed: 0,
    aiContentOptimizations: 0,
    promptSuggestions: 0,
    auditsThisMonth: 0,
    lastAuditDate: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubscription = async () => {
      if (!user) {
        setCurrentPlan(plans.free); // Default to free plan for non-authenticated users
        setUsage({
          citationsUsed: 0,
          aiContentUsed: 0,
          aiContentOptimizations: 0,
          promptSuggestions: 0,
          auditsThisMonth: 0,
          lastAuditDate: null,
        });
        setLoading(false);
        return;
      }

      // Check if Supabase is properly configured
      if (!isSupabaseConfigured()) {
        console.warn('Supabase is not properly configured. Using free plan.');
        setCurrentPlan(plans.free);
        setUsage({
          citationsUsed: 0,
          aiContentUsed: 0,
          aiContentOptimizations: 0,
          promptSuggestions: 0,
          auditsThisMonth: 0,
          lastAuditDate: null,
        });
        setLoading(false);
        return;
      }

      try {
        console.log('Loading subscription data for user:', user.id);

        // Test Supabase connection first with a simple query
        try {
          await safeSupabaseCall(async () => {
            const { error } = await supabase.from('subscriptions').select('count').limit(1);
            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found, which is OK
              throw error;
            }
          }, 5000);
          console.log('✅ Supabase connection test successful');
        } catch (connectionError) {
          console.error('❌ Supabase connection test failed:', connectionError);
          throw new Error('Unable to connect to Supabase');
        }

        // Fetch subscription and usage data with timeout
        const [subscriptionResult, usageResult] = await Promise.allSettled([
          safeSupabaseCall(async () => {
            const { data, error } = await supabase
              .from('subscriptions')
              .select('*')
              .eq('user_id', user.id)
              .maybeSingle();
            
            if (error && error.code !== 'PGRST116') {
              throw error;
            }
            return data;
          }),
          safeSupabaseCall(async () => {
            const { data, error } = await supabase
              .from('subscription_usage')
              .select('*')
              .eq('user_id', user.id)
              .maybeSingle();
            
            if (error && error.code !== 'PGRST116') {
              throw error;
            }
            return data;
          })
        ]);

        // Handle subscription data
        let subscriptionData = null;
        if (subscriptionResult.status === 'fulfilled') {
          subscriptionData = subscriptionResult.value;
          console.log('✅ Subscription data loaded:', subscriptionData);
        } else {
          console.warn('⚠️ Failed to load subscription data:', subscriptionResult.reason);
        }

        // Handle usage data
        let usageData = null;
        if (usageResult.status === 'fulfilled') {
          usageData = usageResult.value;
          console.log('✅ Usage data loaded:', usageData);
        } else {
          console.warn('⚠️ Failed to load usage data:', usageResult.reason);
        }

        // Set current plan based on subscription data
        if (subscriptionData?.plan_id && plans[subscriptionData.plan_id as PlanTier]) {
          const planTier = subscriptionData.plan_id as PlanTier;
          setCurrentPlan(plans[planTier]);
          console.log(`✅ Set plan to: ${planTier}`);
        } else {
          // Default to free plan if no subscription found
          setCurrentPlan(plans.free);
          console.log('✅ Set default plan: free');
        }

        // Set usage data
        if (usageData) {
          setUsage({
            citationsUsed: usageData.citations_used || 0,
            aiContentUsed: usageData.ai_content_used || 0,
            aiContentOptimizations: usageData.ai_content_optimizations || 0,
            promptSuggestions: usageData.prompt_suggestions || 0,
            auditsThisMonth: usageData.audits_this_month || 0,
            lastAuditDate: usageData.last_audit_date ? new Date(usageData.last_audit_date) : null,
          });
          console.log('✅ Set usage data:', {
            citationsUsed: usageData.citations_used || 0,
            aiContentUsed: usageData.ai_content_used || 0,
            aiContentOptimizations: usageData.ai_content_optimizations || 0,
            promptSuggestions: usageData.prompt_suggestions || 0,
            auditsThisMonth: usageData.audits_this_month || 0,
          });
        } else {
          // If no usage data exists, initialize with default values
          setUsage({
            citationsUsed: 0,
            aiContentUsed: 0,
            aiContentOptimizations: 0,
            promptSuggestions: 0,
            auditsThisMonth: 0,
            lastAuditDate: null,
          });
          console.log('✅ Set default usage data');
        }
      } catch (error) {
        console.error('❌ Error loading subscription:', error);
        // Default to free plan on error
        setCurrentPlan(plans.free);
        setUsage({
          citationsUsed: 0,
          aiContentUsed: 0,
          aiContentOptimizations: 0,
          promptSuggestions: 0,
          auditsThisMonth: 0,
          lastAuditDate: null,
        });
        
        // Show user-friendly error message
        if (error instanceof Error) {
          if (error.message.includes('timeout') || error.message.includes('fetch')) {
            console.warn('⚠️ Network timeout - using offline mode');
          } else if (error.message.includes('connect')) {
            console.warn('⚠️ Connection failed - using offline mode');
          } else {
            console.warn('⚠️ Database error - using offline mode:', error.message);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [user]);

  const isFeatureEnabled = (feature: keyof Plan['limits']['features']): boolean => {
    if (!currentPlan) return false;
    return currentPlan.limits.features[feature];
  };

  const getSiteLimit = (): number => {
    return currentPlan?.limits.sites || 1;
  };

  const getCompetitorSiteLimit = (): number => {
    return currentPlan?.limits.competitors || 0;
  };

  const getAuditFrequency = (): string => {
    return currentPlan?.limits.auditFrequency || 'monthly';
  };

  const canRunAudit = (): boolean => {
    if (!currentPlan) return false;
    
    const auditsPerMonth = currentPlan.limits.auditsPerMonth;
    if (auditsPerMonth === Infinity) return true;
    
    return usage.auditsThisMonth < auditsPerMonth;
  };

  const canGenerateContent = (): boolean => {
    if (!currentPlan) return false;
    
    const contentLimit = currentPlan.limits.aiContentGenerations;
    if (contentLimit === Infinity) return true;
    
    return usage.aiContentUsed < contentLimit;
  };

  const canOptimizeContent = (): boolean => {
    if (!currentPlan) return false;
    
    const optimizationLimit = currentPlan.limits.aiContentOptimizations;
    if (optimizationLimit === Infinity) return true;
    if (optimizationLimit === 0) return false;
    
    return usage.aiContentOptimizations < optimizationLimit;
  };

  const canGeneratePrompts = (): boolean => {
    if (!currentPlan) return false;
    
    const promptLimit = currentPlan.limits.promptSuggestions;
    if (promptLimit === Infinity) return true;
    
    return usage.promptSuggestions < promptLimit;
  };

  const canTrackCitations = (): boolean => {
    if (!currentPlan) return false;
    return currentPlan.limits.citationTracking !== 'delayed' || usage.citationsUsed === 0;
  };

  const canTrackMoreCitations = (): boolean => {
    if (!currentPlan) return false;
    
    const citationLimit = currentPlan.limits.citationsPerMonth;
    if (citationLimit === Infinity) return true;
    
    return usage.citationsUsed < citationLimit;
  };

  const getChatbotAccess = (): 'none' | 'basic' | 'full' => {
    if (!currentPlan) return 'none';
    return currentPlan.limits.features.chatbotAccess;
  };

  return (
    <SubscriptionContext.Provider 
      value={{ 
        currentPlan,
        usage,
        isFeatureEnabled,
        getSiteLimit,
        getCompetitorSiteLimit,
        getAuditFrequency,
        canRunAudit,
        canGenerateContent,
        canOptimizeContent,
        canGeneratePrompts,
        canTrackCitations,
        canTrackMoreCitations,
        getChatbotAccess,
        loading 
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};