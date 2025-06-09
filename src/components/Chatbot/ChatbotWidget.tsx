import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, User, Loader2, Minimize2, Maximize2, Lightbulb } from 'lucide-react';
import { useSites } from '../../contexts/SiteContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Generate context-aware suggested prompts based on current page and user data
  const generateSuggestedPrompts = () => {
    const currentPath = location.pathname;
    const siteName = selectedSite?.name || 'my site';
    
    let prompts: string[] = [];

    // Page-specific suggestions
    switch (currentPath) {
      case '/dashboard':
        prompts = [
          `What should I focus on first to improve ${siteName}'s AI visibility?`,
          'How do I interpret my audit scores?',
          'What are the most important AI optimization steps?',
          'How often should I run audits?'
        ];
        break;
      case '/ai-visibility-audit':
        prompts = [
          `How can I improve ${siteName}'s AI visibility score?`,
          'What do the different audit scores mean?',
          'Which score should I prioritize improving first?',
          'How do I fix low schema scores?'
        ];
        break;
      case '/competitive-analysis':
        prompts = [
          'How do I choose the right competitors to track?',
          'What should I do if competitors are outperforming me?',
          'How can I learn from competitor strategies?',
          'What metrics matter most in competitive analysis?'
        ];
        break;
      case '/ai-content-optimizer':
        prompts = [
          'How do I write content that AI systems will cite?',
          'What makes content AI-friendly?',
          'How can I improve my content scores?',
          'What are the best practices for AI content optimization?'
        ];
        break;
      case '/schema-generator':
        prompts = [
          'Which schema types should I implement first?',
          'How do I add schema markup to my website?',
          'Why is schema important for AI visibility?',
          'How do I test if my schema is working?'
        ];
        break;
      case '/citation-tracker':
        prompts = [
          'How can I increase my chances of being cited by AI?',
          'What types of content get cited most often?',
          'How do I improve my citation score?',
          'Why am I not getting any citations?'
        ];
        break;
      case '/voice-assistant-tester':
        prompts = [
          'How do I optimize for voice search?',
          'What questions should I test with voice assistants?',
          'How can I improve voice assistant responses about my site?',
          'Why isn\'t my site mentioned in voice responses?'
        ];
        break;
      case '/llm-site-summaries':
        prompts = [
          'How do I use these summaries to improve AI visibility?',
          'Which summary type is most important?',
          'How can I make my site easier for AI to understand?',
          'Where should I use these summaries on my website?'
        ];
        break;
      case '/entity-coverage-analyzer':
        prompts = [
          'How do I fix entity coverage gaps?',
          'What entities should I focus on for my industry?',
          'How does entity coverage affect AI understanding?',
          'How can I improve my entity coverage score?'
        ];
        break;
      default:
        prompts = [
          `How can I improve ${siteName}'s performance with AI systems?`,
          'What\'s the most important thing to focus on first?',
          'How do I get started with AI visibility optimization?',
          'What are the latest AI SEO best practices?'
        ];
    }

    // Add general helpful prompts
    const generalPrompts = [
      'Explain AI visibility in simple terms',
      'What are the biggest AI SEO mistakes to avoid?',
      'How is AI SEO different from traditional SEO?',
      'What tools does SEOgenix offer?'
    ];

    // Combine and limit to 6 suggestions
    const allPrompts = [...prompts, ...generalPrompts];
    return allPrompts.slice(0, 6);
  };

  // Initialize with welcome message and suggestions
  useEffect(() => {
    if (messages.length === 0) {
      const suggestions = generateSuggestedPrompts();
      setSuggestedPrompts(suggestions);
      
      setMessages([{
        id: '1',
        type: 'assistant',
        content: `✨ Hi! I'm Genie, your AI assistant for SEOgenix. I'm here to help you optimize your content for AI visibility and answer any questions about the platform.

${selectedSite ? `I see you're working with **${selectedSite.name}**. ` : ''}I can help you with:

• **Understanding your audit results** and what they mean
• **Implementing recommendations** from your analysis
• **Optimizing content** for AI systems like ChatGPT and voice assistants
• **Competitive analysis** insights and strategies
• **Citation tracking** and improvement techniques
• **Schema markup** implementation and best practices

What would you like to know? You can ask me anything or try one of the suggested questions below! 🚀`,
        timestamp: new Date(),
        suggestions: suggestions
      }]);
    }
  }, [selectedSite, location.pathname]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

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
          context: {
            current_page: location.pathname,
            site_name: selectedSite?.name,
            site_url: selectedSite?.url,
            total_sites: sites.length,
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

      // Generate new suggestions based on the response
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
    const lowerResponse = aiResponse.toLowerCase();
    
    // Generate follow-up questions based on the conversation
    let suggestions: string[] = [];

    if (lowerMessage.includes('audit') || lowerMessage.includes('score')) {
      suggestions = [
        'How do I improve my lowest scoring area?',
        'What should I prioritize first?',
        'How often should I run new audits?',
        'Can you explain what affects these scores?'
      ];
    } else if (lowerMessage.includes('competitor') || lowerMessage.includes('competition')) {
      suggestions = [
        'How do I find the right competitors to track?',
        'What can I learn from their strategies?',
        'How do I outperform my competitors?',
        'What metrics should I focus on?'
      ];
    } else if (lowerMessage.includes('content') || lowerMessage.includes('writing')) {
      suggestions = [
        'What makes content AI-friendly?',
        'How do I structure content for better AI understanding?',
        'What are the best content optimization practices?',
        'How do I create citation-worthy content?'
      ];
    } else if (lowerMessage.includes('schema') || lowerMessage.includes('markup')) {
      suggestions = [
        'Which schema types should I implement first?',
        'How do I add schema to my website?',
        'How do I test my schema implementation?',
        'What are the most important schema types for AI?'
      ];
    } else if (lowerMessage.includes('citation') || lowerMessage.includes('mention')) {
      suggestions = [
        'How can I get more AI citations?',
        'What content gets cited most often?',
        'How do I track citation opportunities?',
        'Why am I not getting cited by AI systems?'
      ];
    } else {
      // Default follow-up suggestions
      suggestions = [
        'What should I work on next?',
        'Can you give me specific action steps?',
        'How do I measure my progress?',
        'What are the most common mistakes to avoid?'
      ];
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
    const suggestions = generateSuggestedPrompts();
    setSuggestedPrompts(suggestions);
    
    setMessages([{
      id: Date.now().toString(),
      type: 'assistant',
      content: `✨ Chat cleared! I'm Genie, ready to help you with SEOgenix. ${selectedSite ? `Currently working with **${selectedSite.name}**. ` : ''}What would you like to know?`,
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
        if (line.startsWith('✨') || line.startsWith('🚀') || line.startsWith('💡')) {
          return <p key={index} className="text-indigo-600 font-medium">{line}</p>;
        }
        return <p key={index}>{line}</p>;
      });
  };

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
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Genie</h3>
                  <p className="text-xs text-gray-500">Your AI SEO Assistant</p>
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
                      placeholder="Ask Genie anything about SEOgenix..."
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