import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Crown, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import Button from '../ui/Button';

const ChatbotUpsellBanner: React.FC = () => {
  const { user } = useAuth();
  const { currentPlan } = useSubscription();
  const [isVisible, setIsVisible] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  // Only show for free plan users
  const shouldShowBanner = currentPlan?.name === 'free';

  useEffect(() => {
    if (!shouldShowBanner || !user) return;

    // Track session count
    const sessionKey = `session-count-${user.id}`;
    const bannerDismissedKey = `banner-dismissed-${user.id}`;
    
    const currentSessionCount = parseInt(localStorage.getItem(sessionKey) || '0') + 1;
    const bannerDismissed = localStorage.getItem(bannerDismissedKey) === 'true';
    
    localStorage.setItem(sessionKey, currentSessionCount.toString());
    setSessionCount(currentSessionCount);

    // Show banner every 3rd session if not dismissed
    if (currentSessionCount % 3 === 0 && !bannerDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [shouldShowBanner, user]);

  const handleDismiss = () => {
    if (user) {
      localStorage.setItem(`banner-dismissed-${user.id}`, 'true');
    }
    setIsVisible(false);
  };

  const handleUpgrade = () => {
    if (user) {
      localStorage.setItem(`banner-dismissed-${user.id}`, 'true');
    }
    setIsVisible(false);
  };

  if (!shouldShowBanner) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <MessageCircle size={16} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    💬 Want help understanding your reports or improving your content?
                  </p>
                  <p className="text-xs text-indigo-100">
                    Unlock AI guidance with Genie in the Core plan or higher.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Link to="/account-settings" onClick={handleUpgrade}>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    className="bg-white text-indigo-600 hover:bg-indigo-50"
                  >
                    <Crown size={14} className="mr-1" />
                    Upgrade
                  </Button>
                </Link>
                <button
                  onClick={handleDismiss}
                  className="text-white hover:text-indigo-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatbotUpsellBanner;