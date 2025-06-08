import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link2, RefreshCw, ExternalLink, Newspaper } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useSites } from '../../contexts/SiteContext';
import { citationApi } from '../../lib/api';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import FeatureRestriction from '../../components/ui/FeatureRestriction';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Citation {
  id: string;
  site_id: string;
  source_type: string;
  snippet_text: string;
  url: string;
  detected_at: string;
}

// Source logo component with improved visibility
const SourceLogo: React.FC<{ sourceType: string; className?: string }> = ({ sourceType, className = "w-5 h-5" }) => {
  const normalizedSource = sourceType.toLowerCase();
  
  if (normalizedSource.includes('google')) {
    return (
      <div className={`${className} flex items-center justify-center bg-white rounded-full p-1 shadow-md border border-gray-200`}>
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      </div>
    );
  }
  
  if (normalizedSource.includes('reddit')) {
    return (
      <div className={`${className} flex items-center justify-center bg-[#FF4500] rounded-full p-1`}>
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="white">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
        </svg>
      </div>
    );
  }
  
  if (normalizedSource.includes('news') || normalizedSource.includes('article')) {
    return (
      <div className={`${className} flex items-center justify-center bg-[#1a73e8] rounded-full p-1`}>
        <Newspaper className="w-full h-full text-white" strokeWidth={2} />
      </div>
    );
  }
  
  if (normalizedSource.includes('twitter') || normalizedSource.includes('x.com')) {
    return (
      <div className={`${className} flex items-center justify-center bg-black rounded-full p-1`}>
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="white">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </div>
    );
  }
  
  if (normalizedSource.includes('linkedin')) {
    return (
      <div className={`${className} flex items-center justify-center bg-[#0077b5] rounded-full p-1`}>
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="white">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </div>
    );
  }
  
  if (normalizedSource.includes('youtube')) {
    return (
      <div className={`${className} flex items-center justify-center bg-[#FF0000] rounded-full p-1`}>
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="white">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      </div>
    );
  }
  
  if (normalizedSource.includes('facebook')) {
    return (
      <div className={`${className} flex items-center justify-center bg-[#1877F2] rounded-full p-1`}>
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="white">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </div>
    );
  }
  
  if (normalizedSource.includes('github')) {
    return (
      <div className={`${className} flex items-center justify-center bg-[#333] rounded-full p-1`}>
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="white">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      </div>
    );
  }
  
  if (normalizedSource.includes('medium')) {
    return (
      <div className={`${className} flex items-center justify-center bg-black rounded-full p-1`}>
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="white">
          <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
        </svg>
      </div>
    );
  }
  
  if (normalizedSource.includes('stackoverflow') || normalizedSource.includes('stack overflow')) {
    return (
      <div className={`${className} flex items-center justify-center bg-[#F58025] rounded-full p-1`}>
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="white">
          <path d="M15.725 0l-1.72 1.277 6.39 8.588 1.716-1.277L15.725 0zm-3.94 3.418l-1.369 1.644 8.225 6.85 1.369-1.644-8.225-6.85zm-3.15 4.465l-.905 1.94 9.702 4.517.904-1.94-9.701-4.517zm-1.85 4.86l-.44 2.093 10.473 2.201.44-2.092-10.473-2.203zM1.89 15.47V24h19.19v-8.53h-2.133v6.397H4.021v-6.396H1.89zm4.265 2.133v2.13h10.66v-2.13H6.154Z"/>
        </svg>
      </div>
    );
  }
  
  if (normalizedSource.includes('quora')) {
    return (
      <div className={`${className} flex items-center justify-center bg-[#B92B27] rounded-full p-1`}>
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="white">
          <path d="M12.738 18.701a4.441 4.441 0 0 0 1.362-.235l2.345 2.345a6.126 6.126 0 0 1-3.707 1.189c-3.395 0-6.126-2.731-6.126-6.126 0-3.395 2.731-6.126 6.126-6.126 3.395 0 6.126 2.731 6.126 6.126a6.126 6.126 0 0 1-.373 2.126l-1.81-1.81a4.441 4.441 0 0 0 .183-1.316c0-2.45-1.991-4.441-4.441-4.441s-4.441 1.991-4.441 4.441 1.991 4.441 4.441 4.441c.927 0 1.786-.285 2.496-.758l1.538 1.538c-.711.473-1.569.758-2.496.758z"/>
        </svg>
      </div>
    );
  }
  
  // Default fallback icon for unknown sources
  return (
    <div className={`${className} flex items-center justify-center bg-gray-500 rounded-full p-1`}>
      <svg viewBox="0 0 24 24" className="w-full h-full" fill="white">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    </div>
  );
};

const CitationTracker = () => {
  const { isFeatureEnabled, canTrackMoreCitations } = useSubscription();
  const { selectedSite, sites } = useSites();
  const [isChecking, setIsChecking] = useState(false);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [assistantResponse, setAssistantResponse] = useState('');
  const [searchSummary, setSearchSummary] = useState<any>(null);
  const [lastSearchTime, setLastSearchTime] = useState<string | null>(null);

  // If the feature isn't enabled, show the restriction component
  if (!isFeatureEnabled('citationTracking')) {
    return (
      <AppLayout>
        <FeatureRestriction
          title="Citation Tracker"
          description="Monitor when and where AI systems cite your content in their responses."
          requiredPlan="Pro"
        />
      </AppLayout>
    );
  }

  // Load existing citations for the selected site only
  useEffect(() => {
    const loadExistingCitations = async () => {
      if (!selectedSite) {
        setCitations([]);
        return;
      }

      try {
        console.log(`🔍 Loading citations for selected site: ${selectedSite.name}`);
        const siteCitations = await citationApi.getCitations(selectedSite.id);
        setCitations(siteCitations);
        console.log(`✅ Loaded ${siteCitations.length} citations for ${selectedSite.name}`);
      } catch (error) {
        console.error('Error loading existing citations:', error);
        setCitations([]);
      }
    };

    loadExistingCitations();
  }, [selectedSite]);

  const handleCheckCitations = async () => {
    if (!selectedSite) {
      toast.error('Please select a site first');
      return;
    }

    if (!canTrackMoreCitations()) {
      toast.error(`You've reached your monthly citation tracking limit. Upgrade to track more citations.`);
      return;
    }
    
    setIsChecking(true);
    setSearchSummary(null);
    
    try {
      console.log(`🚀 Starting citation check for selected site: ${selectedSite.name}`);
      
      const result = await citationApi.trackCitations(selectedSite.id, selectedSite.url);
      
      // Update assistant response
      if (result.assistant_response) {
        setAssistantResponse(result.assistant_response);
      }
      
      // Update search summary
      if (result.search_summary) {
        setSearchSummary(result.search_summary);
      }
      
      console.log(`✅ Found ${result.new_citations_found} new citations for ${selectedSite.name}`);
      
      // Reload citations for the selected site to get the updated list
      const updatedCitations = await citationApi.getCitations(selectedSite.id);
      setCitations(updatedCitations);
      setLastSearchTime(new Date().toISOString());
      
      if (result.new_citations_found > 0) {
        toast.success(`Found ${result.new_citations_found} new citations for ${selectedSite.name}!`);
      } else {
        toast.success(`Citation check completed for ${selectedSite.name} - no new citations found`);
      }
      
    } catch (error) {
      console.error('❌ Citation check failed:', error);
      toast.error(`Failed to check citations for ${selectedSite.name}`);
    } finally {
      setIsChecking(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Citation Tracker</h1>
          <p className="mt-2 text-gray-600">
            Monitor when and where AI systems cite your content in their responses.
          </p>
          {selectedSite && (
            <div className="mt-2 text-sm text-gray-500">
              Tracking citations for: <span className="font-medium text-gray-700">{selectedSite.name}</span>
            </div>
          )}
        </div>

        {!selectedSite ? (
          <EmptyState
            title="No site selected"
            description="Please select a site from the site selector to start tracking AI citations."
            icon={<Link2 size={24} />}
            actionLabel="Add Your First Site"
            onAction={() => window.location.href = '/add-site'}
          />
        ) : (
          <>
            {/* Search Controls */}
            <Card className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Citation Search</h3>
                  <p className="text-sm text-gray-500">
                    Search across Google, News, and Reddit for citations of {selectedSite.name}.
                    {lastSearchTime && (
                      <span className="block mt-1">
                        Last search: {formatDate(lastSearchTime)}
                      </span>
                    )}
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={handleCheckCitations}
                  isLoading={isChecking}
                  icon={<RefreshCw size={16} className={isChecking ? 'animate-spin' : ''} />}
                >
                  {isChecking ? 'Searching...' : 'Check for Citations'}
                </Button>
              </div>
              
              {searchSummary && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-blue-800 mb-2">Search Results Summary</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center">
                      <SourceLogo sourceType="Google" className="w-5 h-5 mr-2" />
                      <span className="text-blue-600 font-medium">Google:</span>
                      <span className="ml-1 text-blue-800">{searchSummary.google_results || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <SourceLogo sourceType="News" className="w-5 h-5 mr-2" />
                      <span className="text-blue-600 font-medium">News:</span>
                      <span className="ml-1 text-blue-800">{searchSummary.news_results || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <SourceLogo sourceType="Reddit" className="w-5 h-5 mr-2" />
                      <span className="text-blue-600 font-medium">Reddit:</span>
                      <span className="ml-1 text-blue-800">{searchSummary.reddit_results || 0}</span>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">High Authority:</span>
                      <span className="ml-1 text-blue-800">{searchSummary.high_authority_citations || 0}</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Assistant Response */}
            {assistantResponse && (
              <Card className="mb-6 bg-green-50 border border-green-100">
                <h3 className="text-lg font-medium text-green-800 mb-2">AI Assistant Response</h3>
                <p className="text-green-700">{assistantResponse}</p>
              </Card>
            )}

            {/* Citations Results */}
            {citations.length > 0 ? (
              <Card title={`Citations for ${selectedSite.name}`}>
                <div className="mb-4">
                  <a 
                    href={selectedSite.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-indigo-600 transition-colors flex items-center"
                  >
                    {selectedSite.url}
                    <ExternalLink size={14} className="ml-1" />
                  </a>
                </div>
                
                <div className="space-y-4">
                  {citations.map((citation) => (
                    <div key={citation.id} className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <SourceLogo sourceType={citation.source_type} className="w-6 h-6 mr-3" />
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {citation.source_type}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(citation.detected_at)}
                        </span>
                      </div>
                      <blockquote className="mt-2 text-gray-700 italic border-l-4 border-indigo-300 pl-4 py-1">
                        {citation.snippet_text}
                      </blockquote>
                      <div className="mt-2">
                        <a 
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors flex items-center"
                        >
                          View Source
                          <ExternalLink size={14} className="ml-1" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4">
                  <Link to={`/sites/${selectedSite.id}`}>
                    <Button variant="outline" size="sm">
                      View Site Details
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <Card>
                <div className="text-center py-8">
                  <Link2 className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Citations Found Yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    We'll search across Google, News, and Reddit to find where {selectedSite.name} is being cited by AI systems and other sources.
                  </p>
                  <Button
                    variant="primary"
                    onClick={handleCheckCitations}
                    isLoading={isChecking}
                    icon={<RefreshCw size={16} className={isChecking ? 'animate-spin' : ''} />}
                  >
                    Start Citation Search
                  </Button>
                </div>
              </Card>
            )}
            
            <Card className="mt-8 bg-blue-50 border border-blue-100">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-blue-800">About Citation Tracking</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      We search multiple platforms to find where your content is being cited:
                    </p>
                    <ul className="mt-2 list-disc list-inside space-y-1">
                      <li className="flex items-center">
                        <SourceLogo sourceType="Google" className="w-5 h-5 mr-2" />
                        <strong>Google Search:</strong> Web mentions and featured snippets
                      </li>
                      <li className="flex items-center">
                        <SourceLogo sourceType="News" className="w-5 h-5 mr-2" />
                        <strong>News Articles:</strong> Press coverage and industry publications
                      </li>
                      <li className="flex items-center">
                        <SourceLogo sourceType="Reddit" className="w-5 h-5 mr-2" />
                        <strong>Reddit:</strong> Community discussions and recommendations
                      </li>
                    </ul>
                    <p className="mt-2">
                      Improve your citation chances by implementing schema markup, creating authoritative content, and structuring information to directly answer common questions.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </motion.div>
    </AppLayout>
  );
};

export default CitationTracker;