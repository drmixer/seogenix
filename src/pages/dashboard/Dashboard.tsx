import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { siteApi, auditApi, competitorApi } from '../../lib/api';
import { motion } from 'framer-motion';
import { Plus, ExternalLink, Calendar, Trash2, Lock, BarChart3, TrendingUp, Globe, Zap, Target } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

interface Site {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

interface Audit {
  id: string;
  site_id: string;
  ai_visibility_score: number;
  schema_score: number;
  semantic_score: number;
  citation_score: number;
  technical_seo_score: number;
  created_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { currentPlan, getSiteLimit, getAuditFrequency, usage, getCompetitorSiteLimit } = useSubscription();
  const [sites, setSites] = useState<Site[]>([]);
  const [audits, setAudits] = useState<{ [siteId: string]: Audit }>({});
  const [competitorCount, setCompetitorCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      try {
        // Load sites
        const sitesData = await siteApi.getSites();
        setSites(sitesData);

        // Load latest audits for each site
        const auditPromises = sitesData.map(async (site) => {
          try {
            const audit = await auditApi.getLatestAudit(site.id);
            return { siteId: site.id, audit };
          } catch (error) {
            return { siteId: site.id, audit: null };
          }
        });

        const auditResults = await Promise.all(auditPromises);
        const auditMap: { [siteId: string]: Audit } = {};
        
        auditResults.forEach(({ siteId, audit }) => {
          if (audit) {
            auditMap[siteId] = audit;
          }
        });

        setAudits(auditMap);

        // Load competitor count
        try {
          const competitors = await competitorApi.getCompetitorSites(user.id);
          setCompetitorCount(competitors.length);
        } catch (error) {
          console.log('No competitors found');
          setCompetitorCount(0);
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [user]);

  const handleDeleteSite = async (siteId: string) => {
    if (!confirm('Are you sure you want to delete this site? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(siteId);
    
    try {
      await siteApi.deleteSite(siteId);
      setSites(sites.filter(site => site.id !== siteId));
      
      // Remove audit data
      const newAudits = { ...audits };
      delete newAudits[siteId];
      setAudits(newAudits);
      
      toast.success('Site deleted successfully');
    } catch (error) {
      console.error('Error deleting site:', error);
      toast.error('Failed to delete site');
    } finally {
      setIsDeleting(null);
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

  const getOverallScore = (audit: Audit) => {
    return Math.round((
      audit.ai_visibility_score +
      audit.schema_score +
      audit.semantic_score +
      audit.citation_score +
      audit.technical_seo_score
    ) / 5);
  };

  const siteLimit = getSiteLimit();
  const competitorLimit = getCompetitorSiteLimit();
  const canAddMoreSites = sites.length < siteLimit;

  // Calculate average scores across all audits
  const auditValues = Object.values(audits);
  const avgAiVisibility = auditValues.length > 0 
    ? Math.round(auditValues.reduce((sum, audit) => sum + audit.ai_visibility_score, 0) / auditValues.length)
    : 0;
  const avgOverallScore = auditValues.length > 0
    ? Math.round(auditValues.reduce((sum, audit) => sum + getOverallScore(audit), 0) / auditValues.length)
    : 0;

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600 mt-1">
            Here's an overview of your AI visibility optimization platform.
          </p>
        </div>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-indigo-50 border border-indigo-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Globe className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-indigo-800">Total Sites</h3>
                <div className="text-2xl font-bold text-indigo-600">{sites.length}</div>
                <div className="text-xs text-indigo-600">of {siteLimit} allowed</div>
              </div>
            </div>
          </Card>

          <Card className="bg-green-50 border border-green-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-green-800">Avg AI Visibility</h3>
                <div className="text-2xl font-bold text-green-600">{avgAiVisibility}</div>
                <div className="text-xs text-green-600">across all sites</div>
              </div>
            </div>
          </Card>

          <Card className="bg-blue-50 border border-blue-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-blue-800">Competitors</h3>
                <div className="text-2xl font-bold text-blue-600">{competitorCount}</div>
                <div className="text-xs text-blue-600">of {competitorLimit} allowed</div>
              </div>
            </div>
          </Card>

          <Card className="bg-purple-50 border border-purple-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-purple-800">Overall Score</h3>
                <div className="text-2xl font-bold text-purple-600">{avgOverallScore}</div>
                <div className="text-xs text-purple-600">average performance</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Site Limit Warning */}
        {!canAddMoreSites && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Lock className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You've reached your site limit. 
                  <Link to="/account-settings" className="font-medium text-yellow-700 underline ml-1">
                    Upgrade your plan
                  </Link> to add more sites.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/ai-visibility-audit" className="block">
              <div className="flex items-center p-2">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">AI Audits</h3>
                  <p className="text-sm text-gray-500">Analyze AI visibility</p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/competitive-analysis" className="block">
              <div className="flex items-center p-2">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Competitors</h3>
                  <p className="text-sm text-gray-500">Track competition</p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/ai-content-optimizer" className="block">
              <div className="flex items-center p-2">
                <div className="flex-shrink-0">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Optimize Content</h3>
                  <p className="text-sm text-gray-500">AI content scoring</p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/add-site" className="block">
              <div className="flex items-center p-2">
                <div className="flex-shrink-0">
                  <Plus className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Add Site</h3>
                  <p className="text-sm text-gray-500">Start optimizing</p>
                </div>
              </div>
            </Link>
          </Card>
        </div>

        {/* Sites Overview */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Sites</h2>
            {canAddMoreSites && (
              <Link to="/add-site">
                <Button 
                  variant="primary" 
                  size="sm" 
                  icon={<Plus size={16} />}
                >
                  Add Site
                </Button>
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : sites.length === 0 ? (
            <EmptyState
              title="No sites added yet"
              description="Add your first site to start analyzing and optimizing for AI visibility."
              icon={<Globe size={24} />}
              actionLabel="Add Your First Site"
              onAction={() => window.location.href = '/add-site'}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Site
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overall Score
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Audit
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sites.map((site) => {
                    const audit = audits[site.id];
                    const overallScore = audit ? getOverallScore(audit) : null;
                    
                    return (
                      <tr key={site.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{site.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a 
                            href={site.url.startsWith('http') ? site.url : `https://${site.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center"
                          >
                            {site.url}
                            <ExternalLink size={14} className="ml-1" />
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {overallScore ? (
                            <div className="flex items-center">
                              <div className={`text-lg font-bold ${
                                overallScore >= 80 ? 'text-green-600' : 
                                overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {overallScore}
                              </div>
                              <div className="ml-1 text-xs text-gray-500">/100</div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No audit</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {audit ? (
                            <div className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {formatDate(audit.created_at)}
                            </div>
                          ) : (
                            <span className="text-gray-400">Never</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Link to={`/sites/${site.id}`}>
                              <Button variant="outline" size="sm">
                                Manage
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteSite(site.id)}
                              isLoading={isDeleting === site.id}
                              icon={<Trash2 size={14} />}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Plan Information */}
        <Card className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Current Plan: {currentPlan?.name.charAt(0).toUpperCase() + currentPlan?.name.slice(1)}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Sites:</span> {sites.length}/{siteLimit === Infinity ? '∞' : siteLimit}
                </div>
                <div>
                  <span className="font-medium">Competitors:</span> {competitorCount}/{competitorLimit === Infinity ? '∞' : competitorLimit}
                </div>
                <div>
                  <span className="font-medium">Citations:</span> {usage.citationsUsed}/{currentPlan?.limits.citationsPerMonth === Infinity ? '∞' : currentPlan?.limits.citationsPerMonth}
                </div>
                <div>
                  <span className="font-medium">AI Content:</span> {usage.aiContentUsed}/{currentPlan?.limits.aiContentGenerations === Infinity ? '∞' : currentPlan?.limits.aiContentGenerations}
                </div>
              </div>
            </div>
            <Link to="/account-settings">
              <Button variant="outline">
                Manage Plan
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </AppLayout>
  );
};

export default Dashboard;