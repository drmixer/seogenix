import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Zap, TrendingUp, CheckCircle, AlertCircle, Lightbulb, Target } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { contentApi } from '../../lib/api';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import FeatureRestriction from '../../components/ui/FeatureRestriction';
import toast from 'react-hot-toast';

interface ContentAnalysis {
  score: number;
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
  analysis_summary: string;
  word_count: number;
  readability_score: number;
  ai_optimization_score: number;
  semantic_clarity_score: number;
  entity_coverage_score: number;
}

const AiContentOptimizer = () => {
  const { isFeatureEnabled } = useSubscription();
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<string | null>(null);

  // If the feature isn't enabled, show the restriction component
  if (!isFeatureEnabled('contentOptimizer')) {
    return (
      <AppLayout>
        <FeatureRestriction
          title="AI Content Optimizer"
          description="Analyze and optimize your content for maximum AI visibility with detailed scoring and actionable recommendations."
          requiredPlan="Pro"
        />
      </AppLayout>
    );
  }

  const handleAnalyzeContent = async () => {
    if (!content.trim()) {
      toast.error('Please enter some content to analyze');
      return;
    }

    if (content.trim().length < 50) {
      toast.error('Please enter at least 50 characters for meaningful analysis');
      return;
    }

    setIsAnalyzing(true);

    try {
      console.log('🚀 Starting content analysis...');
      const result = await contentApi.analyzeContent(content);
      
      setAnalysis(result);
      setLastAnalysisTime(new Date().toISOString());
      
      toast.success(`Content analyzed! Overall score: ${result.score}/100`);
    } catch (error) {
      console.error('❌ Content analysis failed:', error);
      toast.error('Failed to analyze content. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
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
          <h1 className="text-2xl font-bold text-gray-900">AI Content Optimizer</h1>
          <p className="mt-2 text-gray-600">
            Analyze and optimize your content for maximum AI visibility with detailed scoring and actionable recommendations.
          </p>
          {lastAnalysisTime && (
            <div className="mt-2 text-sm text-gray-500">
              Last analysis: {formatTime(lastAnalysisTime)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Content Editor</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Content
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    rows={12}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Paste your content here to analyze its AI visibility potential. Include blog posts, web pages, product descriptions, or any text content you want to optimize for AI systems..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    {content.length} characters • Minimum 50 characters required
                  </div>
                </div>
                
                <div>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleAnalyzeContent}
                    isLoading={isAnalyzing}
                    disabled={content.trim().length < 50}
                    icon={<Zap size={16} />}
                  >
                    {isAnalyzing ? 'Analyzing Content...' : 'Analyze Content'}
                  </Button>
                </div>
              </div>
            </Card>
            
            <Card className="mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">What We Analyze</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <Target className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>AI Optimization:</strong> How well your content is structured for AI understanding</span>
                </div>
                <div className="flex items-start">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Semantic Clarity:</strong> How clearly your content conveys its meaning</span>
                </div>
                <div className="flex items-start">
                  <FileText className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Entity Coverage:</strong> How comprehensively you cover key topics</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Readability:</strong> How easy your content is to understand</span>
                </div>
                <div className="flex items-start">
                  <Lightbulb className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Citation Potential:</strong> How likely AI systems are to reference your content</span>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            {analysis ? (
              <div className="space-y-6">
                {/* Overall Score */}
                <Card className={`${getScoreBgColor(analysis.score)} border-2`}>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(analysis.score)} mb-2`}>
                      {analysis.score}/100
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Overall AI Visibility Score</h3>
                    <p className="text-sm text-gray-600">
                      {analysis.analysis_summary}
                    </p>
                  </div>
                </Card>

                {/* Detailed Scores */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-blue-50 border border-blue-100">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.ai_optimization_score)}`}>
                        {analysis.ai_optimization_score}/100
                      </div>
                      <h4 className="text-sm font-medium text-blue-800">AI Optimization</h4>
                    </div>
                  </Card>
                  
                  <Card className="bg-green-50 border border-green-100">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.semantic_clarity_score)}`}>
                        {analysis.semantic_clarity_score}/100
                      </div>
                      <h4 className="text-sm font-medium text-green-800">Semantic Clarity</h4>
                    </div>
                  </Card>
                  
                  <Card className="bg-purple-50 border border-purple-100">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.entity_coverage_score)}`}>
                        {analysis.entity_coverage_score}/100
                      </div>
                      <h4 className="text-sm font-medium text-purple-800">Entity Coverage</h4>
                    </div>
                  </Card>
                  
                  <Card className="bg-orange-50 border border-orange-100">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.readability_score)}`}>
                        {analysis.readability_score}/100
                      </div>
                      <h4 className="text-sm font-medium text-orange-800">Readability</h4>
                    </div>
                  </Card>
                </div>

                {/* Content Stats */}
                <Card title="Content Statistics">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Word Count:</span>
                      <span className="ml-2 text-gray-600">{analysis.word_count} words</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Character Count:</span>
                      <span className="ml-2 text-gray-600">{content.length} characters</span>
                    </div>
                  </div>
                </Card>

                {/* Strengths */}
                {analysis.strengths && analysis.strengths.length > 0 && (
                  <Card title="Strengths" className="bg-green-50 border border-green-100">
                    <div className="space-y-2">
                      {analysis.strengths.map((strength, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-green-700 text-sm">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Recommendations */}
                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <Card title="Optimization Recommendations" className="bg-blue-50 border border-blue-100">
                    <div className="space-y-3">
                      {analysis.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start">
                          <Lightbulb className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-blue-700 text-sm">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Weaknesses */}
                {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                  <Card title="Areas for Improvement" className="bg-yellow-50 border border-yellow-100">
                    <div className="space-y-2">
                      {analysis.weaknesses.map((weakness, index) => (
                        <div key={index} className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-yellow-700 text-sm">{weakness}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Implementation Guide */}
                <Card className="bg-indigo-50 border border-indigo-100">
                  <h3 className="text-lg font-medium text-indigo-800 mb-4">How to Implement Improvements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-indigo-700">
                    <div>
                      <h4 className="font-medium mb-2">Content Structure:</h4>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Use clear headings and subheadings</li>
                        <li>Break content into digestible sections</li>
                        <li>Include relevant keywords naturally</li>
                        <li>Add FAQ sections for common questions</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">AI Optimization:</h4>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Define key entities and concepts clearly</li>
                        <li>Use consistent terminology throughout</li>
                        <li>Include factual, authoritative information</li>
                        <li>Structure content to answer specific questions</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Card>
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">AI Content Analysis Ready</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    Paste your content in the editor and click "Analyze Content" to get detailed AI visibility scoring and optimization recommendations.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg max-w-md mx-auto">
                    <p className="text-sm text-blue-700">
                      <strong>Pro Tip:</strong> Include complete paragraphs or sections for the most accurate analysis. The more context you provide, the better the recommendations.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default AiContentOptimizer;