import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Crown, Sparkles, BarChart3, FileText, HelpCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import Button from '../ui/Button';

interface ContextualChatbotUpsellProps {
  trigger: 'report-view' | 'help-section' | 'audit-complete';
  onDismiss?: () => void;
}

const ContextualChatbotUpsell: React.FC<ContextualChatbotUpsellProps> = ({ trigger, onDismiss }) => {
  const { user } = useAuth();
  const { currentPlan } = useSubscription();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  // Only show for free plan users
  const shouldShow = currentPlan?.name === 'free';

  useEffect(() => {
    if (!shouldShow || !user) return;

    // Check if this specific trigger has been shown before
    const triggerKey = `contextual-upsell-${trigger}-${user.id}`;
    const hasSeenTrigger = localStorage.getItem(triggerKey) === 'true';

    if (!hasSeenTrigger) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500); // Show after 1.5 seconds

      return () => clearTimeout(timer);
    }
  }, [shouldShow, user, trigger]);

  const handleDismiss = () => {
    if (user) {
      localStorage.setItem(`contextual-upsell-${trigger}-${user.id}`, 'true');
    }
    setIsVisible(false);
    onDismiss?.();
  };

  const handleUpgrade = () => {
    if (user) {
      localStorage.setItem(`contextual-upsell-${trigger}-${user.id}`, 'true');
    }
    setIsVisible(false);
    onDismiss?.();
  };

  const getUpsellContent = () => {
    switch (trigger) {
      case 'report-view':
        return {
          icon: <BarChart3 size={20} className="text-indigo-600" />,
          title: 'Need help understanding your report?',
          description: 'Get AI-powered explanations of your audit scores and personalized improvement recommendations.',
          cta: 'Get AI Report Analysis'
        };
      case 'help-section':
        return {
          icon: <HelpCircle size={20} className="text-indigo-600" />,
          title: 'Get instant AI guidance',
          description: 'Ask Genie any question about SEOgenix tools and get immediate, personalized help.',
          cta: 'Unlock AI Assistant'
        };
      case 'audit-complete':
        return {
          icon: <Sparkles size={20} className="text-indigo-600" />,
          title: 'Audit complete! What should you do next?',
          description: 'Let Genie analyze your results and provide step-by-step improvement recommendations.',
          cta: 'Get AI Recommendations'
        };
      default:
        return {
          icon: <MessageCircle size={20} className="text-indigo-600" />,
          title: 'Need AI guidance?',
          description: 'Unlock personalized insights and recommendations with Genie.',
          cta: 'Upgrade for AI Help'
        };
    }
  };

  if (!shouldShow) return null;

  const content = getUpsellContent();

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={handleDismiss}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    {content.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">{content.title}</h3>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                {content.description}
              </p>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Core Plan</span>
                  <span className="text-lg font-bold text-indigo-600">$29<span className="text-sm text-gray-500">/mo</span></span>
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center">
                    <Crown size={12} className="mr-1 text-indigo-500" />
                    <span>AI tool guidance & explanations</span>
                  </div>
                  <div className="flex items-center">
                    <Sparkles size={12} className="mr-1 text-indigo-500" />
                    <span>Instant help with platform features</span>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle size={12} className="mr-1 text-indigo-500" />
                    <span>24/7 AI assistant access</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link to="/account-settings" onClick={handleUpgrade}>
                  <Button 
                    variant="primary" 
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {content.cta}
                  </Button>
                </Link>
                
                <button
                  onClick={handleDismiss}
                  className="w-full text-center text-gray-500 hover:text-gray-700 text-sm transition-colors"
                >
                  Maybe later
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-center space-x-4 text-xs text-gray-500">
                  <span>✓ Cancel anytime</span>
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

export default ContextualChatbotUpsell;