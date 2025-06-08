import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Plus, RefreshCw, ExternalLink, Trash2, BarChart3, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useSites } from '../../contexts/SiteContext';
import { competitorApi, auditApi } from '../../lib/api';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import FeatureRestriction from '../../components/ui/FeatureRestriction';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import toast from 'react-hot-toast';

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface CompetitorSite {
  id: string;
  user_id: string;
  site_id: string;
  url: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface CompetitorAudit {
  id: string;
  competitor_site_id: string;
  ai_visibility_score: number;
  schema_score: number;
  semantic_score: number;
  citation_score: number;
  technical_seo_score: number;
  created_at: string;
}

interface UserAudit {
  id: string;
  site_id: string;
  ai_visibility_score: number;
  schema_score: number;
  semantic_score: number;
  citation_score: number;
  technical_seo_score: number;
  created_at: string;
}

const CompetitiveAnalysis = () => {
  const { user } = useAuth();
  const { isFeatureEnabled, getCompetitorSiteLimit } = useSubscription();
  const { selectedSite, sites } = useSites();
  
  const [competitors, setCompetitors] = useState<CompetitorSite[]>([]);
  const [competitorAudits, setCompetitorAudits] = useState<{ [key: string]: CompetitorAudit }>({});
  const [userAudit, setUserAudit] = useState<UserAudit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState<{ [key: string]: boolean }>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCompetitorName, setNewCompetitorName] = useState('');
  const [newCompetitorUrl, setNewCompetitorUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // If the feature isn't enabled, show the restriction component
  if (!isFeatureEnabled('competitiveAnalysis')) {
    return (
      <AppLayout>
        <FeatureRestriction
          title="Competitive Analysis"
          description="Track and compare your AI visibility performance against competitors."
          requiredPlan="Pro"
        />
      </AppLayout>
    );
  }

  // Load competitors and audits
  useEffect(() => {
    const loadData = async () => {
      if (!user || !selectedSite) {
        setIsLoading(false);
        return;
      }

      try {
        // Load competitors
        const competitorsData = await competitorApi.getCompetitorSites(user.id);
        const siteCompetitors = competitorsData.filter(comp => comp.site_id === selectedSite.id);
        setCompetitors(siteCompetitors);

        // Load competitor audits
        const auditPromises = siteCompetitors.map(async (competitor) => {
          const audits = await competitorApi.getCompetitorAudits(competitor.id);
          return { competitorId: competitor.id, audit: audits[0] || null };
        });

        const auditResults = await Promise.all(auditPromises);
        const auditsMap: { [key: string]: CompetitorAudit } = {};
        auditResults.forEach(({ competitorId, audit }) => {
          if (audit) {
            auditsMap[competitorId] = audit;
          }
        });
        setCompetitorAudits(auditsMap);

        // Load user's latest audit for comparison
        const userAuditData = await auditApi.getLatestAudit(selectedSite.id);
        setUserAudit(userAuditData);

      } catch (error) {
        console.error('Error loading competitive analysis data:', error);
        toast.error('Failed to load competitive analysis data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, selectedSite]);

  const handleAddCompetitor = async () => {
    if (!user || !selectedSite || !newCompetitorName.trim() || !newCompetitorUrl.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const competitorLimit = getCompetitorSiteLimit();
    if (competitors.length >= competitorLimit) {
      toast.error(`You've reached your competitor limit of ${competitorLimit}. Upgrade to track more competitors.`);
      return;
    }

    setIsAdding(true);

    try {
      // Validate URL
      let formattedUrl = newCompetitorUrl;
      if (!newCompetitorUrl.match(/^https?:\/\//i)) {
        formattedUrl = 'https://' + newCompetitorUrl;
      }

      const newCompetitor = await competitorApi.addCompetitorSite(
        user.id,
        formattedUrl,
        newCompetitorName,
        selectedSite.id
      );

      setCompetitors([...competitors, newCompetitor]);
      setNewCompetitorName('');
      setNewCompetitorUrl('');
      setShowAddForm(false);
      toast.success('Competitor added successfully');
    } catch (error) {
      console.error('Error adding competitor:', error);
      toast.error('Failed to add competitor');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteCompetitor = async (competitorId: string) => {
    if (!confirm('Are you sure you want to delete this competitor?')) {
      return;
    }

    try {
      await competitorApi.deleteCompetitorSite(competitorId);
      setCompetitors(competitors.filter(comp => comp.id !== competitorId));
      
      // Remove audit data
      const newAudits = { ...competitorAudits };
      delete newAudits[competitorId];
      setCompetitorAudits(newAudits);
      
      toast.success('Competitor deleted successfully');
    } catch (error) {
      console.error('Error deleting competitor:', error);
      toast.error('Failed to delete competitor');
    }
  };

  const handleAnalyzeCompetitor = async (competitor: CompetitorSite) => {
    setIsAnalyzing({ ...isAnalyzing, [competitor.id]: true });

    try {
      const audit = await competitorApi.runCompetitorAnalysis(competitor.id, competitor.url);
      setCompetitorAudits({ ...competitorAudits, [competitor.id]: audit });
      toast.success(`Analysis completed for ${competitor.name}`);
    } catch (error) {
      console.error('Error analyzing competitor:', error);
      toast.error(`Failed to analyze ${competitor.name}`);
    } finally {
      setIsAnalyzing({ ...isAnalyzing, [competitor.id]: false });
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

  const getOverallScore = (audit: UserAudit | CompetitorAudit) => {
    return Math.round((
      audit.ai_visibility_score +
      audit.schema_score +
      audit.semantic_score +
      audit.citation_score +
      audit.technical_seo_score
    ) / 5);
  };

  // Prepare comparison chart data
  const getComparisonChartData = () => {
    if (!userAudit) return null;

    const datasets = [
      {
        label: selectedSite?.name || 'Your Site',
        data: [
          userAudit.ai_visibility_score,
          userAudit.schema_score,
          userAudit.semantic_score,
          userAudit.citation_score,
          userAudit.technical_seo_score
        ],
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(79, 70, 229, 1)',
      }
    ];

    // Add competitor data
    competitors.forEach((competitor, index) => {
      const audit = competitorAudits[competitor.id];
      if (audit) {
        const colors = [
          'rgba(239, 68, 68, 0.2)', // red
          'rgba(34, 197, 94, 0.2)', // green
          'rgba(251, 191, 36, 0.2)', // yellow
          'rgba(168, 85, 247, 0.2)', // purple
          'rgba(6, 182, 212, 0.2)', // cyan
        ];
        const borderColors = [
          'rgba(239, 68, 68, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(6, 182, 212, 1)',
        ];

        datasets.push({
          label: competitor.name,
          data: [
            audit.ai_visibility_score,
            audit.schema_score,
            audit.semantic_score,
            audit.citation_score,
            audit.technical_seo_score
          ],
          backgroundColor: colors[index % colors.length],
          borderColor: borderColors[index % borderColors.length],
          borderWidth: 2,
          pointBackgroundColor: borderColors[index % borderColors.length],
        });
      }
    });

    return {
      labels: ['AI Visibility', 'Schema', 'Semantic', 'Citation', 'Technical SEO'],
      datasets
    };
  };

  const chartData = getComparisonChartData();

  const radarOptions = {
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 100
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const
      }
    }
  };

  if (!selectedSite) {
    return (
      <AppLayout>
        <EmptyState
          title="No site selected"
          description="Please select a site to start competitive analysis."
          icon={<TrendingUp size={24} />}
          actionLabel="Add Your First Site"
          onAction={() => window.location.href = '/add-site'}
        />
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Competitive Analysis</h1>
          <p className="mt-2 text-gray-600">
            Track and compare your AI visibility performance against competitors.
          </p>
          {selectedSite && (
            <div className="mt-2 text-sm text-gray-500">
              Analyzing competitors for: <span className="font-medium text-gray-700">{selectedSite.name}</span>
            </div>
          )}
        </div>

        {/* Comparison Chart */}
        {chartData && userAudit && (
          <Card title="Performance Comparison" className="mb-8">
            <div className="h-96">
              <Radar data={chartData} options={radarOptions} />
            </div>
          </Card>
        )}

        {/* Competitors Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Competitors</h2>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAddForm(true)}
                  disabled={competitors.length >= getCompetitorSiteLimit()}
                  icon={<Plus size={16} />}
                >
                  Add
                </Button>
              </div>

              {competitors.length >= getCompetitorSiteLimit() && (
                <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        You've reached your competitor limit of {getCompetitorSiteLimit()}. Upgrade to track more competitors.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {showAddForm && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Add Competitor</h3>
                  <div className="space-y-3">
                    <Input
                      id="competitorName"
                      label="Competitor Name"
                      type="text"
                      placeholder="Competitor Inc."
                      value={newCompetitorName}
                      onChange={(e) => setNewCompetitorName(e.target.value)}
                    />
                    <Input
                      id="competitorUrl"
                      label="Website URL"
                      type="text"
                      placeholder="https://competitor.com"
                      value={newCompetitorUrl}
                      onChange={(e) => setNewCompetitorUrl(e.target.value)}
                    />
                    <div className="flex space-x-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAddCompetitor}
                        isLoading={isAdding}
                      >
                        Add
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowAddForm(false);
                          setNewCompetitorName('');
                          setNewCompetitorUrl('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {competitors.map((competitor) => {
                  const audit = competitorAudits[competitor.id];
                  const isAnalyzingThis = isAnalyzing[competitor.id];

                  return (
                    <div key={competitor.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{competitor.name}</h4>
                          <a 
                            href={competitor.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-500 hover:text-indigo-600 transition-colors flex items-center"
                          >
                            {competitor.url}
                            <ExternalLink size={12} className="ml-1" />
                          </a>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAnalyzeCompetitor(competitor)}
                            isLoading={isAnalyzingThis}
                            icon={<RefreshCw size={14} className={isAnalyzingThis ? 'animate-spin' : ''} />}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCompetitor(competitor.id)}
                            icon={<Trash2 size={14} />}
                          />
                        </div>
                      </div>

                      {audit ? (
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {getOverallScore(audit)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Overall Score
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {formatDate(audit.created_at)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <div className="text-gray-400 text-xs">No analysis yet</div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {competitors.length === 0 && (
                  <div className="text-center py-8">
                    <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No competitors added yet</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {userAudit ? (
              <Card title="Detailed Comparison">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Site
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Overall
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          AI Visibility
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Schema
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Semantic
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Citation
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Technical
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* User's site */}
                      <tr className="bg-indigo-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-indigo-900">
                              {selectedSite.name} (You)
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-indigo-900">
                            {getOverallScore(userAudit)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {userAudit.ai_visibility_score}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {userAudit.schema_score}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {userAudit.semantic_score}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {userAudit.citation_score}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {userAudit.technical_seo_score}
                        </td>
                      </tr>

                      {/* Competitors */}
                      {competitors.map((competitor) => {
                        const audit = competitorAudits[competitor.id];
                        if (!audit) return null;

                        const userOverall = getOverallScore(userAudit);
                        const competitorOverall = getOverallScore(audit);
                        const isWinning = userOverall > competitorOverall;

                        return (
                          <tr key={competitor.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {competitor.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm font-bold ${isWinning ? 'text-red-600' : 'text-green-600'}`}>
                                {competitorOverall}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {audit.ai_visibility_score}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {audit.schema_score}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {audit.semantic_score}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {audit.citation_score}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {audit.technical_seo_score}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {competitors.filter(comp => competitorAudits[comp.id]).length === 0 && (
                  <div className="text-center py-8">
                    <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Add competitors and run analysis to see detailed comparisons
                    </p>
                  </div>
                )}
              </Card>
            ) : (
              <Card>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Audit Data</h3>
                  <p className="text-gray-500 mb-4">
                    Run an audit for {selectedSite.name} first to enable competitive analysis.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => window.location.href = '/ai-visibility-audit'}
                  >
                    Run Site Audit
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default CompetitiveAnalysis;