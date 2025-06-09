import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, User, Loader2, Minimize2, Maximize2, Lightbulb, Lock, Crown, Zap } from 'lucide-react';
import { useSites } from '../../contexts/SiteContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  suggestions?: string[];
}

interface ChatbotWidgetProps {
  className?: string;
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { selectedSite, sites } = useSites();
  const { currentPlan, isFeatureEnabled } = useSubscription();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if chatbot is available based on subscription
  const isChatbotAvailable = currentPlan && currentPlan.name !== 'free';
  const isFullFeatured = currentPlan && (currentPlan.name === 'pro' || currentPlan.name === 'agency');
  const isBasicChatbot = currentPlan && currentPlan.name === 'core';

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && isChatbotAvailable) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized, isChatbotAvailable]);

  // Generate context-aware suggested prompts based on subscription level
  const generateSuggestedPrompts = () => {
    const currentPath = location.pathname;
    const siteName = selectedSite?.name || 'my site';
    
    let prompts: string[] = [];

    if (isFullFeatured) {
      // Pro/Agency: Full functionality including report interpretation and suggestions
      switch (currentPath) {
        case '/dashboard':
          prompts = [
            `What should I focus on first to improve ${siteName}'s AI visibility?`,
            'How do I interpret my audit scores?',
            'What are the most important AI optimization steps?',
            'Can you analyze my recent performance trends?'
          ];
          break;
        case '/ai-visibility-audit':
          prompts = [
            `How can I improve ${siteName}'s AI visibility score?`,
            'What do my audit scores mean and what should I prioritize?',
            'Why is my schema score low and how do I fix it?',
            'Can you suggest specific improvements based on my results?'
          ];
          break;
        case '/competitive-analysis':
          prompts = [
            'How do I choose the right competitors to track?',
            'What should I do if competitors are outperforming me?',
            'Can you analyze my competitive position?',
            'What strategies should I adopt based on competitor data?'
          ];
          break;
        case '/ai-content-optimizer':
          prompts = [
            'How do I write content that AI systems will cite?',
            'Can you analyze my content scores and suggest improvements?',
            'What specific changes will boost my content performance?',
            'How can I optimize this content for better AI visibility?'
          ];
          break;
        default:
          prompts = [
            `How can I improve ${siteName}'s performance with AI systems?`,
            'Can you analyze my current metrics and suggest next steps?',
            'What are my biggest optimization opportunities?',
            'How do I prioritize my AI visibility improvements?'
          ];
      }
    } else if (isBasicChatbot) {
      // Core: Tool guidance and explanations only
      switch (currentPath) {
        case '/dashboard':
          prompts = [
            'How do I use the dashboard features?',
            'What do the different metrics mean?',
            'How do I navigate between tools?',
            'What should I do first as a new user?'
          ];
          break;
        case '/ai-visibility-audit':
          prompts = [
            'How do I run an AI visibility audit?',
            'What does the audit analyze?',
            'How often should I run audits?',
            'What do the different audit scores mean?'
          ];
          break;
        case '/schema-generator':
          prompts = [
            'How do I use the schema generator?',
            'What types of schema should I implement?',
            'How do I add schema to my website?',
            'Why is schema important for AI visibility?'
          ];
          break;
        case '/citation-tracker':
          prompts = [
            'How does the citation tracker work?',
            'What sources does it check?',
            'How do I interpret citation results?',
            'How often should I check for citations?'
          ];
          break;
        default:
          prompts = [
            'How do I use this tool?',
            'What does this feature do?',
            'How do I get started with SEOgenix?',
            'What are the main features available?'
          ];
      }
    }

    return prompts.slice(0, 6);
  };

  // Initialize with welcome message based on subscription
  useEffect(() => {
    if (messages.length === 0 && isChatbotAvailable) {
      const suggestions = generateSuggestedPrompts();
      setSuggestedPrompts(suggestions);
      
      let welcomeMessage = '';
      
      if (isFullFeatured) {
        welcomeMessage = `✨ Hi! I'm Genie, your AI assistant for SEOgenix. I'm here to help you optimize your content for AI visibility and provide personalized insights.

${selectedSite ? `I see you're working with **${selectedSite.name}**. ` : ''}I can help you with:

• **Understanding your reports** and what they mean
• **Analyzing your performance** and identifying trends
• **Providing specific recommendations** for improvement
• **Interpreting audit results** and competitive data
• **Suggesting optimization strategies** tailored to your content
• **Proactive alerts** when metrics need attention

I have full access to your data and can provide detailed, actionable insights! 🚀`;
      } else if (isBasicChatbot) {
        welcomeMessage = `✨ Hi! I'm Genie, your AI assistant for SEOgenix. I'm here to help you understand and use our platform effectively.

${selectedSite ? `I see you're working with **${selectedSite.name}**. ` : ''}I can help you with:

• **Tool guidance** and how to use SEOgenix features
• **Feature explanations** and what each tool does
• **Getting started** with AI visibility optimization
• **Understanding metrics** and what they measure
• **Navigation help** and finding the right tools

💡 **Want personalized insights and recommendations?** Upgrade to Pro for full AI analysis and custom suggestions!`;
      }

      setMessages([{
        id: '1',
        type: 'assistant',
        content: welcomeMessage,
        timestamp: new Date(),
        suggestions: suggestions
      }]);
    }
  }, [selectedSite, location.pathname, isChatbotAvailable, isFullFeatured, isBasicChatbot]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading || !isChatbotAvailable) return;

    // Check for restricted content on Core plan
    if (isBasicChatbot && !isFullFeatured) {
      const restrictedKeywords = [
        'analyze', 'improve', 'suggest', 'recommendation', 'fix', 'optimize',
        'score', 'performance', 'trend', 'insight', 'strategy'
      ];
      
      const hasRestrictedContent = restrictedKeywords.some(keyword => 
        content.toLowerCase().includes(keyword)
      );
      
      if (hasRestrictedContent) {
        const upgradeMessage: Message = {
          id: Date.now().toString(),
          type: 'assistant',
          content: `🔒 I'd love to help you with personalized analysis and recommendations, but that requires a Pro or Agency plan!

On your current Core plan, I can help with:
• How to use SEOgenix tools
• Understanding what features do
• Navigation and getting started

**Upgrade to Pro** to unlock:
• Detailed report analysis
• Custom improvement suggestions  
• Performance insights and trends
• Proactive optimization alerts

Would you like to know how to use a specific tool instead?`,
          timestamp: new Date(),
          suggestions: [
            'How do I run an AI visibility audit?',
            'What does the schema generator do?',
            'How do I use the citation tracker?',
            'Tell me about SEOgenix features'
          ]
        };
        
        setMessages(prev => [...prev, upgradeMessage]);
        setInputValue('');
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chatbot`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.trim(),
          user_id: user?.id,
          site_id: selectedSite?.id,
          subscription_level: currentPlan?.name || 'free',
          context: {
            current_page: location.pathname,
            site_name: selectedSite?.name,
            site_url: selectedSite?.url,
            total_sites: sites.length,
            is_full_featured: isFullFeatured,
            is_basic_chatbot: isBasicChatbot,
            user_activity: {
              last_page: location.pathname,
              has_selected_site: !!selectedSite,
              sites_count: sites.length
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Generate new suggestions based on the response and subscription level
      const newSuggestions = generateContextualSuggestions(content, data.response);

      // Replace loading message with actual response
      setMessages(prev => prev.map(msg => 
        msg.isLoading ? {
          ...msg,
          content: data.response || 'I apologize, but I encountered an issue processing your request. Please try again.',
          isLoading: false,
          suggestions: newSuggestions
        } : msg
      ));

      setSuggestedPrompts(newSuggestions);

    } catch (error) {
      console.error('Genie error:', error);
      
      // Replace loading message with error message
      setMessages(prev => prev.map(msg => 
        msg.isLoading ? {
          ...msg,
          content: 'I apologize, but I encountered an issue processing your request. Please try again or contact support if the problem persists.',
          isLoading: false
        } : msg
      ));
      
      toast.error('Failed to get response from Genie');
    } finally {
      setIsLoading(false);
    }
  };

  const generateContextualSuggestions = (userMessage: string, aiResponse: string): string[] => {
    const lowerMessage = userMessage.toLowerCase();
    
    let suggestions: string[] = [];

    if (isFullFeatured) {
      // Pro/Agency: Full suggestions including analysis and recommendations
      if (lowerMessage.includes('audit') || lowerMessage.includes('score')) {
        suggestions = [
          'Can you analyze my specific audit results?',
          'What should I prioritize to improve my scores?',
          'How do my scores compare to industry benchmarks?',
          'What specific actions will boost my lowest score?'
        ];
      } else if (lowerMessage.includes('competitor') || lowerMessage.includes('competition')) {
        suggestions = [
          'How do I outperform my top competitor?',
          'Can you analyze my competitive gaps?',
          'What strategies are my competitors using?',
          'How do I track competitive changes over time?'
        ];
      } else if (lowerMessage.includes('content') || lowerMessage.includes('writing')) {
        suggestions = [
          'Can you review my content and suggest improvements?',
          'What specific changes will boost my content score?',
          'How do I optimize this content for AI citations?',
          'What content gaps should I address first?'
        ];
      } else {
        suggestions = [
          'Can you analyze my current performance?',
          'What are my biggest optimization opportunities?',
          'How do I prioritize my next improvements?',
          'What metrics should I focus on this week?'
        ];
      }
    } else if (isBasicChatbot) {
      // Core: Tool guidance only
      if (lowerMessage.includes('audit') || lowerMessage.includes('score')) {
        suggestions = [
          'How do I run an audit?',
          'What do the different scores measure?',
          'How often should I run audits?',
          'How do I interpret audit results?'
        ];
      } else if (lowerMessage.includes('competitor') || lowerMessage.includes('competition')) {
        suggestions = [
          'How do I add competitors to track?',
          'What does competitive analysis show?',
          'How do I use the competitive analysis tool?',
          'What metrics can I compare?'
        ];
      } else if (lowerMessage.includes('content') || lowerMessage.includes('writing')) {
        suggestions = [
          'How do I use the content optimizer?',
          'What does the content generator do?',
          'How do I create AI-friendly content?',
          'What tools help with content optimization?'
        ];
      } else {
        suggestions = [
          'How do I use this feature?',
          'What tools are available?',
          'How do I get started?',
          'What does this metric mean?'
        ];
      }
    }

    return suggestions.slice(0, 4);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const clearChat = () => {
    if (!isChatbotAvailable) return;
    
    const suggestions = generateSuggestedPrompts();
    setSuggestedPrompts(suggestions);
    
    const welcomeMessage = isFullFeatured 
      ? `✨ Chat cleared! I'm Genie, ready to provide detailed insights and recommendations for SEOgenix. ${selectedSite ? `Currently working with **${selectedSite.name}**. ` : ''}What would you like to analyze?`
      : `✨ Chat cleared! I'm Genie, ready to help you understand and use SEOgenix tools. ${selectedSite ? `Currently working with **${selectedSite.name}**. ` : ''}How can I help you navigate the platform?`;
    
    setMessages([{
      id: Date.now().toString(),
      type: 'assistant',
      content: welcomeMessage,
      timestamp: new Date(),
      suggestions: suggestions
    }]);
  };

  const formatMessageContent = (content: string) => {
    // Enhanced markdown-like formatting
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('• ')) {
          return <li key={index} className="ml-4 list-disc">{line.substring(2)}</li>;
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="ml-4 list-disc">{line.substring(2)}</li>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={index} className="font-semibold text-indigo-700">{line.substring(2, line.length - 2)}</p>;
        }
        if (line.includes('**') && line.split('**').length === 3) {
          const parts = line.split('**');
          return <p key={index}>{parts[0]}<strong className="text-indigo-700">{parts[1]}</strong>{parts[2]}</p>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        if (line.startsWith('✨') || line.startsWith('🚀') || line.startsWith('💡') || line.startsWith('🔒')) {
          return <p key={index} className="text-indigo-600 font-medium">{line}</p>;
        }
        return <p key={index}>{line}</p>;
      });
  };

  // Free plan upgrade prompt
  if (!isChatbotAvailable) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`fixed bottom-6 right-6 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-4 shadow-lg max-w-sm ${className}`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Lock size={16} className="text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-medium text-sm mb-1">Need AI Guidance?</h3>
            <p className="text-indigo-100 text-xs mb-3">
              Unlock Genie, your AI assistant for personalized optimization insights and tool guidance.
            </p>
            <Link to="/account-settings">
              <Button size="sm" variant="secondary" className="w-full text-xs">
                <Crown size={12} className="mr-1" />
                Upgrade to Core
              </Button>
            </Link>
          </div>
          <button
            onClick={() => {
              const element = document.querySelector('.fixed.bottom-6.right-6') as HTMLElement;
              if (element) element.style.display = 'none';
            }}
            className="text-white hover:text-indigo-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className={`fixed bottom-6 right-6 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 ${className}`}
          >
            <div className="relative">
              <Sparkles size={24} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              {isFullFeatured && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <Zap size={8} className="text-white" />
                </div>
              )}
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : '700px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 ${
              isMinimized ? 'w-80' : 'w-96'
            } ${className}`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b border-gray-200 rounded-t-lg ${
              isFullFeatured 
                ? 'bg-gradient-to-r from-green-50 to-blue-50' 
                : 'bg-gradient-to-r from-indigo-50 to-purple-50'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isFullFeatured 
                      ? 'bg-gradient-to-r from-green-600 to-blue-600' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600'
                  }`}>
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  {isFullFeatured && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Zap size={8} className="text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 flex items-center">
                    Genie
                    {isFullFeatured && (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                        Pro
                      </span>
                    )}
                    {isBasicChatbot && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Core
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {isFullFeatured 
                      ? 'Your AI SEO Analyst' 
                      : 'Your AI Tool Guide'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-indigo-100 rounded transition-colors"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-indigo-100 rounded transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div key={message.id}>
                      <div
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            {message.type === 'assistant' && (
                              <Sparkles size={16} className="mt-1 flex-shrink-0 text-indigo-600" />
                            )}
                            {message.type === 'user' && (
                              <User size={16} className="mt-1 flex-shrink-0 text-white" />
                            )}
                            <div className="flex-1">
                              {message.isLoading ? (
                                <div className="flex items-center space-x-2">
                                  <Loader2 size={16} className="animate-spin" />
                                  <span className="text-sm">Genie is thinking...</span>
                                </div>
                              ) : (
                                <div className="text-sm space-y-1">
                                  {formatMessageContent(message.content)}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className={`text-xs mt-2 ${
                            message.type === 'user' ? 'text-indigo-200' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                      
                      {/* Suggestions */}
                      {message.type === 'assistant' && message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center text-xs text-gray-500 mb-2">
                            <Lightbulb size={12} className="mr-1" />
                            Suggested questions:
                          </div>
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block w-full text-left text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-2 rounded border border-indigo-200 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested Prompts (when no conversation) */}
                {messages.length <= 1 && suggestedPrompts.length > 0 && (
                  <div className="px-4 pb-4">
                    <div className="text-xs text-gray-500 mb-2 flex items-center">
                      <Lightbulb size={12} className="mr-1" />
                      Try asking:
                    </div>
                    <div className="space-y-2">
                      {suggestedPrompts.slice(0, 3).map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(prompt)}
                          className="block w-full text-left text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-2 rounded border border-indigo-200 transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSubmit} className="flex space-x-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        isFullFeatured 
                          ? "Ask Genie to analyze your data or suggest improvements..."
                          : "Ask Genie how to use SEOgenix tools..."
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={!inputValue.trim() || isLoading}
                      icon={<Send size={16} />}
                    />
                  </form>
                  <div className="flex justify-between items-center mt-2">
                    <button
                      onClick={clearChat}
                      className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Clear chat
                    </button>
                    <div className="text-xs text-gray-400">
                      Press Enter to send
                    </div>
                  </div>
                  
                  {/* Upgrade prompt for Core users */}
                  {isBasicChatbot && (
                    <div className="mt-3 p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-md border border-purple-200">
                      <div className="flex items-center text-xs text-purple-700">
                        <Crown size={12} className="mr-1" />
                        <span className="font-medium">Want personalized insights?</span>
                      </div>
                      <p className="text-xs text-purple-600 mt-1">
                        Upgrade to Pro for detailed analysis and custom recommendations.
                      </p>
                      <Link to="/account-settings">
                        <Button size="sm" variant="outline" className="mt-2 text-xs">
                          Upgrade to Pro
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;