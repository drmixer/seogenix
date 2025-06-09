import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, User, Loader2, Minimize2, Maximize2 } from 'lucide-react';
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

interface LandingChatbotProps {
  className?: string;
}

const LandingChatbot: React.FC<LandingChatbotProps> = ({ className = '' }) => {
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

  // Initialize with welcome message and suggestions
  useEffect(() => {
    if (messages.length === 0) {
      const suggestions = [
        "What is AI visibility and why does it matter?",
        "How does SEOgenix help with AI optimization?",
        "What's the difference between traditional SEO and AI visibility?",
        "Can you explain the pricing plans?",
        "How do I get started with SEOgenix?",
        "What features are included in each plan?"
      ];
      setSuggestedPrompts(suggestions);
      
      const welcomeMessage = `✨ Hi! I'm Genie, your AI assistant for SEOgenix. I'm here to help you understand how our platform can boost your content's visibility to AI systems like ChatGPT, Perplexity, and voice assistants.

I can help you with:

• **Understanding AI visibility** and why it's crucial for modern SEO
• **Exploring our features** like AI audits, schema generation, and citation tracking
• **Choosing the right plan** for your needs and budget
• **Getting started** with optimizing your content for AI systems
• **Learning about pricing** and what's included in each tier

What would you like to know about SEOgenix? 🚀`;

      setMessages([{
        id: '1',
        type: 'assistant',
        content: welcomeMessage,
        timestamp: new Date(),
        suggestions: suggestions
      }]);
    }
  }, []);

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
      // Call the landing chatbot edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/landingChatbot`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.trim()
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
      console.error('Landing chatbot error:', error);
      
      // Replace loading message with error message
      setMessages(prev => prev.map(msg => 
        msg.isLoading ? {
          ...msg,
          content: 'I apologize, but I encountered an issue processing your request. Please try again or contact our support team.',
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

    if (lowerMessage.includes('pricing') || lowerMessage.includes('plan') || lowerMessage.includes('cost')) {
      suggestions = [
        'What features are included in the free plan?',
        'How does the Core plan compare to Pro?',
        'Is there a discount for annual billing?',
        'Can I upgrade or downgrade my plan anytime?'
      ];
    } else if (lowerMessage.includes('ai visibility') || lowerMessage.includes('what is')) {
      suggestions = [
        'How is AI visibility different from traditional SEO?',
        'Which AI systems does SEOgenix optimize for?',
        'How do I measure my current AI visibility?',
        'What are the main benefits of AI optimization?'
      ];
    } else if (lowerMessage.includes('feature') || lowerMessage.includes('tool')) {
      suggestions = [
        'How does the AI Visibility Audit work?',
        'What is schema generation and why do I need it?',
        'Can you explain the Citation Tracker feature?',
        'How does competitive analysis help my SEO?'
      ];
    } else if (lowerMessage.includes('start') || lowerMessage.includes('begin') || lowerMessage.includes('get started')) {
      suggestions = [
        'How long does it take to see results?',
        'Do I need technical knowledge to use SEOgenix?',
        'Can I try SEOgenix before committing to a paid plan?',
        'What kind of websites work best with SEOgenix?'
      ];
    } else if (lowerMessage.includes('chatgpt') || lowerMessage.includes('perplexity') || lowerMessage.includes('voice assistant')) {
      suggestions = [
        'How does SEOgenix help with ChatGPT citations?',
        'What about optimization for voice assistants like Siri?',
        'How do I track when AI systems mention my content?',
        'Can SEOgenix help with Google\'s AI search features?'
      ];
    } else {
      suggestions = [
        'What makes SEOgenix different from other SEO tools?',
        'How quickly can I see improvements in AI visibility?',
        'Do you offer support and training?',
        'Can I see a demo of the platform?'
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
    const suggestions = [
      "What is AI visibility and why does it matter?",
      "How does SEOgenix help with AI optimization?",
      "What's the difference between traditional SEO and AI visibility?",
      "Can you explain the pricing plans?",
      "How do I get started with SEOgenix?",
      "What features are included in each plan?"
    ];
    setSuggestedPrompts(suggestions);
    
    const welcomeMessage = `✨ Chat cleared! I'm Genie, ready to help you learn about SEOgenix and how we can boost your content's visibility to AI systems. What would you like to know?`;
    
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
          return <p key={index} className="font-semibold text-purple-700">{line.substring(2, line.length - 2)}</p>;
        }
        if (line.includes('**') && line.split('**').length === 3) {
          const parts = line.split('**');
          return <p key={index}>{parts[0]}<strong className="text-purple-700">{parts[1]}</strong>{parts[2]}</p>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        if (line.startsWith('✨') || line.startsWith('🚀') || line.startsWith('💡')) {
          return <p key={index} className="text-purple-600 font-medium">{line}</p>;
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
            className={`fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-500 hover:from-purple-700 hover:via-blue-600 hover:to-cyan-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 ${className}`}
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
              height: isMinimized ? 'auto' : '500px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 ${
              isMinimized ? 'w-80' : 'w-80 max-w-sm'
            } ${className}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 rounded-t-lg bg-gradient-to-r from-purple-50 to-cyan-50">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Genie</h3>
                  <p className="text-xs text-gray-500">SEOgenix Assistant</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-purple-100 rounded transition-colors"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-purple-100 rounded transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="h-64 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div key={message.id}>
                      <div
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-3 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            {message.type === 'assistant' && (
                              <Sparkles size={16} className="mt-1 flex-shrink-0 text-purple-600" />
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
                            message.type === 'user' ? 'text-purple-200' : 'text-gray-500'
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
                            <Sparkles size={12} className="mr-1" />
                            Try asking:
                          </div>
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block w-full text-left text-xs text-purple-600 hover:text-purple-800 hover:bg-purple-50 p-2 rounded border border-purple-200 transition-colors"
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
                      <Sparkles size={12} className="mr-1" />
                      Popular questions:
                    </div>
                    <div className="space-y-2">
                      {suggestedPrompts.slice(0, 3).map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(prompt)}
                          className="block w-full text-left text-xs text-purple-600 hover:text-purple-800 hover:bg-purple-50 p-2 rounded border border-purple-200 transition-colors"
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
                      placeholder="Ask me about SEOgenix..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={!inputValue.trim() || isLoading}
                      icon={<Send size={16} />}
                      className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600"
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

export default LandingChatbot;