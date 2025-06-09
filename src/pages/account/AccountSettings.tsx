import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, CreditCard, Shield, AlertTriangle, ExternalLink, Check, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import supabase from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const AccountSettings = () => {
  const { user } = useAuth();
  const { currentPlan, usage } = useSubscription();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nextBillingDate, setNextBillingDate] = useState<string | null>(null);
  
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSubscriptionDetails = async () => {
      if (!user) return;

      try {
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (subscriptionData) {
          // Calculate next billing date (30 days from subscription creation)
          const createdAt = new Date(subscriptionData.created_at);
          const nextBilling = new Date(createdAt);
          nextBilling.setDate(nextBilling.getDate() + 30);
          setNextBillingDate(nextBilling.toISOString());
        }
      } catch (error) {
        console.error('Error loading subscription details:', error);
      }
    };

    loadSubscriptionDetails();
  }, [user]);
  
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || email === user?.email) {
      setError('Please enter a new email address');
      return;
    }
    
    setIsUpdatingEmail(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      
      toast.success('Email update initiated. Please check your new email for confirmation.');
    } catch (error) {
      console.error('Error updating email:', error);
      setError(error instanceof Error ? error.message : 'Failed to update email');
      toast.error('Failed to update email');
    } finally {
      setIsUpdatingEmail(false);
    }
  };
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsUpdatingPassword(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      toast.success('Password updated successfully');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      setError(error instanceof Error ? error.message : 'Failed to update password');
      toast.error('Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
      return;
    }
    
    setIsCancelling(true);
    
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', user?.id);

      if (error) throw error;
      
      toast.success('Subscription cancelled successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const plans = [
    {
      name: 'Free',
      price: 0,
      yearlyPrice: 0,
      color: 'green',
      features: [
        { name: '1 Website / Project', included: true },
        { name: 'AI Visibility Audit (1/month, basic)', included: true },
        { name: 'Schema Generator (basic types only)', included: true },
        { name: 'AI Content Generator (3 outputs/month)', included: true },
        { name: 'Prompt Match Suggestions (5/month)', included: true },
        { name: 'Citation Tracker (top 3 sources, delayed)', included: true },
        { name: 'Community Support', included: true },
        { name: 'AI Content Optimizer', included: false },
        { name: 'Entity Coverage Analyzer', included: false },
        { name: 'Voice Assistant Tester', included: false },
        { name: 'LLM Site Summaries', included: false },
        { name: 'Competitive Analysis', included: false },
        { name: 'Priority Support', included: false },
      ]
    },
    {
      name: 'Core',
      price: 29,
      yearlyPrice: 261,
      color: 'blue',
      popular: false,
      features: [
        { name: '2 Websites / Projects', included: true },
        { name: 'AI Visibility Audit (2/month, full report)', included: true },
        { name: 'Full Schema Generator access', included: true },
        { name: 'AI Content Generator (20 outputs/month)', included: true },
        { name: 'AI Content Optimizer (up to 10 pages/month)', included: true },
        { name: 'Prompt Match Suggestions (20/month)', included: true },
        { name: 'Citation Tracker (real-time + full sources)', included: true },
        { name: 'Entity Coverage Analyzer', included: true },
        { name: 'Email Support', included: true },
        { name: 'Voice Assistant Tester', included: false },
        { name: 'LLM Site Summaries', included: false },
        { name: 'Competitive Analysis', included: false },
        { name: 'Priority Support', included: false },
      ]
    },
    {
      name: 'Pro',
      price: 59,
      yearlyPrice: 531,
      color: 'purple',
      popular: true,
      features: [
        { name: '5 Websites / Projects', included: true },
        { name: 'Weekly AI Visibility Audits', included: true },
        { name: 'LLM Site Summaries', included: true },
        { name: 'Voice Assistant Tester (unlimited)', included: true },
        { name: 'AI Content Generator (60 outputs/month)', included: true },
        { name: 'AI Content Optimizer (30 pages/month)', included: true },
        { name: 'Prompt Match Suggestions (60/month)', included: true },
        { name: 'Competitive Analysis (3 competitors)', included: true },
        { name: 'Priority Support', included: true },
        { name: 'Exportable Reports', included: false },
        { name: 'Team Collaboration', included: false },
        { name: 'Dedicated Support', included: false },
        { name: 'Early Access to New Features', included: false },
      ]
    },
    {
      name: 'Agency',
      price: 99,
      yearlyPrice: 891,
      color: 'gray',
      features: [
        { name: '10 Websites / Projects', included: true },
        { name: 'Daily AI Visibility Audits', included: true },
        { name: 'Unlimited AI Content Generator & Optimizer', included: true },
        { name: 'Unlimited Prompt Match Suggestions', included: true },
        { name: 'Competitive Analysis (10 competitors)', included: true },
        { name: 'Exportable Reports (PDF/CSV)', included: true },
        { name: 'Team Collaboration (up to 5 members)', included: true },
        { name: 'Early Access to New Features', included: true },
        { name: 'Dedicated Support & Onboarding', included: true },
      ]
    }
  ];

  const currentPlanData = plans.find(plan => plan.name.toLowerCase() === currentPlan?.name);

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account information, security settings, and subscription.
          </p>
        </div>

        <div className="space-y-8 max-w-6xl">
          {/* Profile Information */}
          <Card title="Profile Information">
            <div className="flex items-center mb-6">
              <div className="bg-primary-100 text-primary-800 flex items-center justify-center h-16 w-16 rounded-full">
                <span className="text-xl font-medium">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {user?.email || 'User'}
                </h3>
                <p className="text-sm text-gray-500">
                  {user?.id ? 'User ID: ' + user.id.substring(0, 8) + '...' : 'Not signed in'}
                </p>
              </div>
            </div>
            
            <form onSubmit={handleUpdateEmail}>
              <div className="space-y-4">
                <div>
                  <Input
                    id="email"
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isUpdatingEmail}
                  >
                    Update Email
                  </Button>
                </div>
              </div>
            </form>
          </Card>
          
          {/* Security */}
          <Card title="Security">
            <form onSubmit={handleUpdatePassword}>
              <div className="space-y-4">
                <div>
                  <Input
                    id="password"
                    label="New Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                <div>
                  <Input
                    id="confirmPassword"
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isUpdatingPassword}
                  >
                    Update Password
                  </Button>
                </div>
              </div>
            </form>
          </Card>
          
          {/* Current Subscription */}
          {currentPlan && (
            <Card title="Current Subscription">
              <div className="space-y-6">
                <div className="bg-primary-50 border-l-4 border-primary-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CreditCard className="h-5 w-5 text-primary-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-primary-800">
                        Current Plan: {currentPlan.name.charAt(0).toUpperCase() + currentPlan.name.slice(1)}
                      </h3>
                      {nextBillingDate && currentPlan.name !== 'free' && (
                        <p className="mt-2 text-sm text-primary-700">
                          Next billing date: {formatDate(nextBillingDate)}
                        </p>
                      )}
                      <div className="mt-2 text-sm text-primary-700">
                        <p>Usage this month:</p>
                        <ul className="mt-1 list-disc list-inside">
                          <li>AI Content Generated: {usage.aiContentUsed}/{currentPlan.limits.aiContentGenerations === Infinity ? '∞' : currentPlan.limits.aiContentGenerations}</li>
                          <li>Content Optimizations: {usage.aiContentOptimizations}/{currentPlan.limits.aiContentOptimizations === Infinity ? '∞' : currentPlan.limits.aiContentOptimizations}</li>
                          <li>Prompt Suggestions: {usage.promptSuggestions}/{currentPlan.limits.promptSuggestions === Infinity ? '∞' : currentPlan.limits.promptSuggestions}</li>
                          <li>Audits: {usage.auditsThisMonth}/{currentPlan.limits.auditsPerMonth === Infinity ? '∞' : currentPlan.limits.auditsPerMonth}</li>
                        </ul>
                      </div>
                      {currentPlan.name !== 'free' && (
                        <div className="mt-2">
                          <a
                            href="https://app.lemonsqueezy.com/billing"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-500 inline-flex items-center text-sm"
                          >
                            Manage Billing
                            <ExternalLink size={14} className="ml-1" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Subscription Plans */}
          <Card title="Subscription Plans">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-4">
              {plans.map((plan) => {
                const isCurrentPlan = currentPlanData?.name === plan.name;
                const colorClasses = {
                  green: 'border-green-200 bg-green-50',
                  blue: 'border-blue-200 bg-blue-50',
                  purple: 'border-purple-200 bg-purple-50',
                  gray: 'border-gray-200 bg-gray-50'
                };

                return (
                  <div
                    key={plan.name}
                    className={`relative rounded-lg border-2 p-6 ${
                      isCurrentPlan 
                        ? 'border-primary-500 bg-primary-50' 
                        : plan.popular 
                        ? 'border-purple-500 bg-purple-50' 
                        : colorClasses[plan.color as keyof typeof colorClasses]
                    }`}
                  >
                    {plan.popular && !isCurrentPlan && (
                      <div className="absolute top-0 right-0 -translate-y-1/2 px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-medium">
                        Most Popular
                      </div>
                    )}
                    {isCurrentPlan && (
                      <div className="absolute top-0 right-0 -translate-y-1/2 px-3 py-1 bg-primary-600 text-white rounded-full text-xs font-medium">
                        Current Plan
                      </div>
                    )}
                    
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                      <p className="mt-4">
                        <span className="text-3xl font-extrabold text-gray-900">${plan.price}</span>
                        <span className="text-base font-medium text-gray-500">/month</span>
                      </p>
                      {plan.price > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          or ${plan.yearlyPrice}/year (save 25%)
                        </p>
                      )}
                    </div>
                    
                    <ul className="mt-6 space-y-3">
                      {plan.features.slice(0, 6).map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          {feature.included ? (
                            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          ) : (
                            <X className="h-4 w-4 text-gray-300 mr-2 flex-shrink-0" />
                          )}
                          <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                      {plan.features.length > 6 && (
                        <li className="text-sm text-gray-500">
                          +{plan.features.length - 6} more features
                        </li>
                      )}
                    </ul>
                    
                    <div className="mt-6">
                      {isCurrentPlan ? (
                        <Button variant="secondary" className="w-full" disabled>
                          Current Plan
                        </Button>
                      ) : (
                        <Button variant="primary" className="w-full">
                          {plan.name === 'Free' ? 'Downgrade' : 'Upgrade'} to {plan.name}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {currentPlan && currentPlan.name !== 'free' && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <Button
                  variant="danger"
                  onClick={handleCancelSubscription}
                  isLoading={isCancelling}
                >
                  Cancel Subscription
                </Button>
                <p className="mt-2 text-sm text-gray-500">
                  Your subscription will remain active until the end of your current billing period.
                </p>
              </div>
            )}
          </Card>
          
          {/* Advanced Settings */}
          <Card title="Advanced Settings">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Data Export</h3>
                  <p className="text-sm text-gray-500">
                    Download all your data including audits, schemas, and citations.
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Export Data
                </Button>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-red-600">Delete Account</h3>
                    <p className="text-sm text-gray-500">
                      Permanently delete your account and all your data.
                    </p>
                  </div>
                  <Button variant="danger" size="sm">
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default AccountSettings;