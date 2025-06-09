import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Sparkles, ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import Button from '../ui/Button';

const AiGuidanceUpsell: React.FC = () => {
  const { user } = useAuth();
  const { currentPlan } = useSubscription();
  const [isVisible, setIsVisible] = useState(false);

  // Check if user is on free plan and hasn't seen the popup
  const shouldShowUpsell = currentPlan?.name === 'free';

  useEffect(() => {
    if (!shouldShowUpsell || !user) return;

    // Check if user has already seen this popup
    const hasSeenUpsell = localStorage.getItem(`ai-guidance-upsell-seen-${user.id}`);
    
    if (!hasSeenUpsell) {
      // Show popup after a short delay to let the page load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [shouldShowUpsell, user]);

  const handleDismiss = () => {
    if (user) {
      // Mark as seen for this user
      localStorage.setItem(`ai-guidance-upsell-seen-${user.id}`, 'true');
    }
    setIsVisible(false);
  };

  const handleUpgrade = () => {
    if (user) {
      localStorage.setItem(`ai-guidance-upsell-seen-${user.id}`, 'true');
    }
    setIsVisible(false);
  };

  if (!shouldShowUpsell) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={handleDismiss}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl shadow-2xl max-w-md w-full mx-4"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-xl p-6 text-white">
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 text-white hover:text-indigo-200 transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Sparkles size={24} className="text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Meet Genie</h2>
                  <p className="text-indigo-100 text-sm">Your AI SEO Assistant</p>
                </div>
              </div>
              
              <p className="text-indigo-100 text-sm leading-relaxed">
                Get personalized guidance, tool explanations, and optimization insights powered by AI.
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageCircle size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">Tool Guidance</h3>
                    <p className="text-gray-600 text-xs">Learn how to use every SEOgenix feature effectively</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Crown size={16} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">Pro Analysis</h3>
                    <p className="text-gray-600 text-xs">Get detailed insights and personalized recommendations</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Sparkles size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">Smart Suggestions</h3>
                    <p className="text-gray-600 text-xs">Receive proactive alerts and optimization tips</p>
                  </div>
                </div>
              </div>

              {/* Pricing Comparison */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="text-gray-500 text-sm">Current: Free Plan</span>
                    <div className="text-red-600 text-xs">❌ No AI Guidance</div>
                  </div>
                  <div className="text-right">
                    <span className="text-indigo-600 text-sm font-medium">Core Plan</span>
                    <div className="text-green-600 text-xs">✅ AI Tool Guide</div>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-gray-900">$29</span>
                  <span className="text-gray-500 text-sm">/month</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link to="/account-settings" onClick={handleUpgrade}>
                  <Button 
                    variant="primary" 
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    icon={<ArrowRight size={16} />}
                  >
                    Upgrade to Core Plan
                  </Button>
                </Link>
                
                <button
                  onClick={handleDismiss}
                  className="w-full text-center text-gray-500 hover:text-gray-700 text-sm transition-colors"
                >
                  Maybe later
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-center space-x-6 text-xs text-gray-500">
                  <span>✓ Cancel anytime</span>
                  <span>✓ 30-day guarantee</span>
                  <span>✓ Instant access</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AiGuidanceUpsell;