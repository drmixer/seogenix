import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Info, Lock, Crown, BarChart3, MessageCircle, Zap, Target, Brain, Quote, Mic, FileText } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useSites } from '../../contexts/SiteContext';
import { auditApi } from '../../lib/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AIVisibilityScoreProps {
  className?: string;
}

interface ScoreHistory {
  date: string;
  overall_score: number;
  ai_understanding: number;
  citation_likelihood: number;
  conversational_readiness: number;
  content_structure: number;
}

interface Subscore {
  name: string;
  score: number;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const AIVisibilityScore: React.FC<AIVisibilityScoreProps> = ({ className = '' }) => {
  const { currentPlan, isFeatureEnabled } = useSubscription();
  const { selectedSite, sites } = useSites();
  const [currentScore, setCurrentScore] = useState(0);
  const [previousScore, setPreviousScore] = useState(0);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);
  const [subscores, setSubscores] = useState<Subscore[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyInsights, setWeeklyInsights] = useState<string[]>([]);
  const [competitorBenchmark, setCompetitorBenchmark] = useState<number | null>(null);
  const [industryBenchmark, setIndustryBenchmark] = useState<number | null>(null);

  const isFreePlan = currentPlan?.name === 'free';
  const isCorePlan = currentPlan?.name === 'core';
  const isProOrAgency = currentPlan?.name === 'pro' || currentPlan?.name === 'agency';

  useEffect(() => {
    loadAIVisibilityData();
  }, [selectedSite]);

  const loadAIVisibilityData = async () => {
    if (!selectedSite) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Load audit history for the selected site
      const audits = await auditApi.getAudits(selectedSite.id);
      
      if (audits.length === 0) {
        setIsLoading(false);
        return;
      }

      // Calculate AI Visibility Score from audit data
      const latestAudit = audits[0];
      const overallScore = calculateOverallScore(latestAudit);
      
      setCurrentScore(overallScore);
      setLastUpdated(latestAudit.created_at);

      // Calculate previous score for trend
      if (audits.length > 1) {
        const previousAudit = audits[1];
        setPreviousScore(calculateOverallScore(previousAudit));
      }

      // Generate score history (last 6 weeks)
      const history = generateScoreHistory(audits);
      setScoreHistory(history);

      // Calculate subscores
      const calculatedSubscores = calculateSubscores(latestAudit);
      setSubscores(calculatedSubscores);

      // Generate weekly insights
      const insights = generateWeeklyInsights(audits, calculatedSubscores);
      setWeeklyInsights(insights);

      // Set benchmarks for Pro/Agency users
      if (isProOrAgency) {
        setCompetitorBenchmark(Math.floor(Math.random() * 20) + 65); // Simulated competitor average
        setIndustryBenchmark(Math.floor(Math.random() * 15) + 70); // Simulated industry average
      }

    } catch (error) {
      console.error('Error loading AI Visibility data:', error);
      toast.error('Failed to load AI Visibility Score');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateOverallScore = (audit: any): number => {
    return Math.round((
      audit.ai_visibility_score +
      audit.schema_score +
      audit.semantic_score +
      audit.citation_score +
      audit.technical_seo_score
    ) / 5);
  };

  const calculateSubscores = (audit: any): Subscore[] => {
    return [
      {
        name: 'ai_understanding',
        score: Math.round((audit.ai_visibility_score + audit.schema_score + audit.semantic_score) / 3),
        label: getScoreLabel(Math.round((audit.ai_visibility_score + audit.schema_score + audit.semantic_score) / 3)),
        description: 'Schema markup, semantic clarity, and entity coverage',
        icon: <Brain size={20} />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-200'
      },
      {
        name: 'citation_likelihood',
        score: audit.citation_score,
        label: getScoreLabel(audit.citation_score),
        description: 'Authority signals and tracked AI citations',
        icon: <Quote size={20} />,
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200'
      },
      {
        name: 'conversational_readiness',
        score: Math.round((audit.semantic_score + audit.technical_seo_score) / 2),
        label: getScoreLabel(Math.round((audit.semantic_score + audit.technical_seo_score) / 2)),
        description: 'Voice assistant and featured snippet optimization',
        icon: <Mic size={20} />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 border-purple-200'
      },
      {
        name: 'content_structure',
        score: Math.round((audit.technical_seo_score + audit.schema_score) / 2),
        label: getScoreLabel(Math.round((audit.technical_seo_score + audit.schema_score) / 2)),
        description: 'Content formatting and AI system compatibility',
        icon: <FileText size={20} />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 border-orange-200'
      }
    ];
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Fair';
    if (score >= 40) return 'Needs Work';
    return 'Poor';
  };

  const generateScoreHistory = (audits: any[]): ScoreHistory[] => {
    return audits.slice(0, 6).reverse().map(audit => ({
      date: new Date(audit.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      overall_score: calculateOverallScore(audit),
      ai_understanding: Math.round((audit.ai_visibility_score + audit.schema_score + audit.semantic_score) / 3),
      citation_likelihood: audit.citation_score,
      conversational_readiness: Math.round((audit.semantic_score + audit.technical_seo_score) / 2),
      content_structure: Math.round((audit.technical_seo_score + audit.schema_score) / 2)
    }));
  };

  const generateWeeklyInsights = (audits: any[], subscores: Subscore[]): string[] => {
    const insights: string[] = [];
    
    if (audits.length > 1) {
      const current = audits[0];
      const previous = audits[1];
      
      // Find biggest improvement
      const improvements = [
        { name: 'AI Visibility', change: current.ai_visibility_score - previous.ai_visibility_score },
        { name: 'Schema', change: current.schema_score - previous.schema_score },
        { name: 'Semantic', change: current.semantic_score - previous.semantic_score },
        { name: 'Citation', change: current.citation_score - previous.citation_score },
        { name: 'Technical SEO', change: current.technical_seo_score - previous.technical_seo_score }
      ];
      
      const biggestGain = improvements.reduce((max, item) => item.change > max.change ? item : max);
      const biggestDrop = improvements.reduce((min, item) => item.change < min.change ? item : min);
      
      if (biggestGain.change > 0) {
        insights.push(`This week's biggest gain: ${biggestGain.name} improved by ${biggestGain.change} points`);
      }
      
      if (biggestDrop.change < -2) {
        insights.push(`Attention needed: ${biggestDrop.name} dropped by ${Math.abs(biggestDrop.change)} points`);
      }
    }
    
    // Find lowest subscore for opportunity
    const lowestSubscore = subscores.reduce((min, item) => item.score < min.score ? item : min);
    if (lowestSubscore.score < 70) {
      insights.push(`Biggest opportunity: Improve ${lowestSubscore.name.replace('_', ' ')} (currently ${lowestSubscore.score}/100)`);
    }
    
    return insights.slice(0, 3);
  };

  const getScoreTrend = () => {
    const change = currentScore - previousScore;
    if (change > 0) {
      return { icon: <TrendingUp size={16} className="text-green-600" />, text: `+${change} since last week`, color: 'text-green-600' };
    } else if (change < 0) {
      return { icon: <TrendingDown size={16} className="text-red-600" />, text: `${change} since last week`, color: 'text-red-600' };
    }
    return { icon: null, text: 'No change since last week', color: 'text-gray-600' };
  };

  const getScoreColor = (score: number): string => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 55) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 85) return 'from-green-500 to-green-600';
    if (score >= 70) return 'from-blue-500 to-blue-600';
    if (score >= 55) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  // Chart configuration
  const chartData = {
    labels: scoreHistory.map(h => h.date),
    datasets: [
      {
        label: 'AI Visibility Score',
        data: scoreHistory.map(h => h.overall_score),
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(79, 70, 229)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(79, 70, 229, 0.5)',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: Math.max(0, Math.min(...scoreHistory.map(h => h.overall_score)) - 10),
        max: Math.min(100, Math.max(...scoreHistory.map(h => h.overall_score)) + 10),
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.6)',
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.6)',
        }
      }
    }
  };

  const trend = getScoreTrend();

  if (isLoading) {
    return (
      <Card className={`${className}`}>
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Card>
    );
  }

  if (!selectedSite || currentScore === 0) {
    return (
      <Card className={`${className}`}>
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">AI Visibility Score</h3>
          <p className="text-gray-500 mb-4">
            {!selectedSite 
              ? 'Select a site to view your AI Visibility Score'
              : 'Run your first audit to generate your AI Visibility Score'
            }
          </p>
          {selectedSite && (
            <Link to="/ai-visibility-audit">
              <Button variant="primary">Run First Audit</Button>
            </Link>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Score Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        
        <div className="relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">AI Visibility Score</h2>
              <p className="text-sm text-gray-500">
                Last updated: {new Date(lastUpdated).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getScoreColor(currentScore)} mb-1`}>
                {currentScore}
                <span className="text-lg text-gray-400">/100</span>
              </div>
              {trend.icon && (
                <div className={`flex items-center justify-end text-sm ${trend.color}`}>
                  {trend.icon}
                  <span className="ml-1">{trend.text}</span>
                </div>
              )}
            </div>
          </div>

          {/* Benchmarking for Pro/Agency */}
          {isProOrAgency && (competitorBenchmark || industryBenchmark) && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Benchmarking</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {competitorBenchmark && (
                  <div>
                    <span className="text-blue-700">vs Competitors:</span>
                    <span className={`ml-2 font-medium ${currentScore > competitorBenchmark ? 'text-green-600' : 'text-red-600'}`}>
                      {currentScore > competitorBenchmark ? '+' : ''}{currentScore - competitorBenchmark} points
                    </span>
                  </div>
                )}
                {industryBenchmark && (
                  <div>
                    <span className="text-blue-700">vs Industry:</span>
                    <span className={`ml-2 font-medium ${currentScore > industryBenchmark ? 'text-green-600' : 'text-red-600'}`}>
                      {currentScore > industryBenchmark ? '+' : ''}{currentScore - industryBenchmark} points
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Score Trend Chart */}
          {scoreHistory.length > 1 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">6-Week Trend</h3>
              <div className="h-32">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Weekly Insights for Pro/Agency */}
          {isProOrAgency && weeklyInsights.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-800 mb-2">This Week's Insights</h3>
              <ul className="space-y-1">
                {weeklyInsights.map((insight, index) => (
                  <li key={index} className="text-sm text-green-700 flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* Subscores Breakdown */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Score Breakdown</h3>
          {isFreePlan && (
            <div className="flex items-center text-sm text-gray-500">
              <Lock size={14} className="mr-1" />
              <span>Unlock full breakdown with Core+</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subscores.map((subscore, index) => {
            const isLocked = isFreePlan && index > 0; // Free users see only first subscore
            const showRandomly = isFreePlan && index === Math.floor(Math.random() * subscores.length);
            const shouldShow = !isFreePlan || index === 0 || showRandomly;

            if (!shouldShow && isFreePlan) {
              return (
                <div key={subscore.name} className={`p-4 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 relative ${subscore.bgColor}`}>
                  <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Lock className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Upgrade to unlock</p>
                    </div>
                  </div>
                  <div className="opacity-30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={subscore.color}>
                          {subscore.icon}
                        </div>
                        <span className="font-medium text-gray-900 capitalize">
                          {subscore.name.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">••</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div className="bg-gray-400 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500">•••••••••••••••••••••••••••</p>
                  </div>
                </div>
              );
            }

            return (
              <div key={subscore.name} className={`p-4 rounded-lg border ${subscore.bgColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={subscore.color}>
                      {subscore.icon}
                    </div>
                    <span className="font-medium text-gray-900 capitalize">
                      {subscore.name.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${getScoreColor(subscore.score)}`}>
                      {subscore.score}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      {subscore.label}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className={`bg-gradient-to-r ${getScoreBgColor(subscore.score)} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${subscore.score}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600">{subscore.description}</p>
              </div>
            );
          })}
        </div>

        {/* Upgrade CTA for Free/Core Users */}
        {(isFreePlan || isCorePlan) && (
          <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
            <div className="flex items-start space-x-3">
              <Crown className="h-5 w-5 text-indigo-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-indigo-900 mb-1">
                  {isFreePlan ? 'Want to know why your score changed — and how to fix it?' : 'Get AI-powered insights and recommendations'}
                </h4>
                <p className="text-sm text-indigo-700 mb-3">
                  {isFreePlan 
                    ? 'Unlock AI-driven breakdowns and improvement tracking with Core or Pro.'
                    : 'Upgrade to Pro for competitor benchmarking, proactive suggestions, and AI chatbot integration.'
                  }
                </p>
                <Link to="/account-settings">
                  <Button size="sm" variant="primary" className="bg-gradient-to-r from-indigo-600 to-purple-600">
                    <Crown size={14} className="mr-1" />
                    {isFreePlan ? 'Upgrade to Core' : 'Upgrade to Pro'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Chatbot Integration Hint for Pro/Agency */}
      {isProOrAgency && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-8 w-8 text-blue-600" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Ask Genie about your score</h4>
              <p className="text-sm text-blue-700">
                Try asking: "Why did my score drop?" or "How can I improve my citation score?"
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AIVisibilityScore;