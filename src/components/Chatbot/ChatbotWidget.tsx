import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { useSites } from '../../contexts/SiteContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatbotWidgetProps {
  className?: string;
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { selectedSite, sites } = useSites();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'assistant',
        content: `Hi! I'm your AI assistant for SEOgenix. I can help you with:

• Understanding your audit results and recommendations
• Implementing schema markup and technical improvements
• Optimizing content for AI visibility
• Competitive analysis insights
• Citation tracking strategies
• Voice assistant optimization

${selectedSite ? `I see you're working with ${selectedSite.name}. ` : ''}What would you like to know?`,
        timestamp: new Date()
      }]);
    }
  }, [selectedSite]);

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
            current_page: window.location.pathname,
            site_name: selectedSite?.name,
            site_url: selectedSite?.url,
            total_sites: sites.length
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

      // Replace loading message with actual response
      setMessages(prev => prev.map(msg => 
        msg.isLoading ? {
          ...msg,
          content: data.response || 'I apologize, but I encountered an issue processing your request. Please try again.',
          isLoading: false
        } : msg
      ));

    } catch (error) {
      console.error('Chatbot error:', error);
      
      // Replace loading message with error message
      setMessages(prev => prev.map(msg => 
        msg.isLoading ? {
          ...msg,
          content: 'I apologize, but I encountered an issue processing your request. Please try again or contact support if the problem persists.',
          isLoading: false
        } : msg
      ));
      
      toast.error('Failed to get response from AI assistant');
    } finally {
      setIsLoading(false);
    }
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
    setMessages([{
      id: Date.now().toString(),
      type: 'assistant',
      content: `Chat cleared! I'm here to help you with SEOgenix. ${selectedSite ? `Currently working with ${selectedSite.name}. ` : ''}What would you like to know?`,
      timestamp: new Date()
    }]);
  };

  const formatMessageContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('• ')) {
          return <li key={index} className="ml-4">{line.substring(2)}</li>;
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="ml-4">{line.substring(2)}</li>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={index} className="font-semibold">{line.substring(2, line.length - 2)}</p>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
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
            className={`fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transition-colors ${className}`}
          >
            <MessageCircle size={24} />
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
              height: isMinimized ? 'auto' : '600px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 ${
              isMinimized ? 'w-80' : 'w-96'
            } ${className}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-indigo-50 rounded-t-lg">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">AI Assistant</h3>
                  <p className="text-xs text-gray-500">SEOgenix Helper</p>
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
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.type === 'assistant' && (
                            <Bot size={16} className="mt-1 flex-shrink-0 text-indigo-600" />
                          )}
                          {message.type === 'user' && (
                            <User size={16} className="mt-1 flex-shrink-0 text-white" />
                          )}
                          <div className="flex-1">
                            {message.isLoading ? (
                              <div className="flex items-center space-x-2">
                                <Loader2 size={16} className="animate-spin" />
                                <span className="text-sm">Thinking...</span>
                              </div>
                            ) : (
                              <div className="text-sm space-y-1">
                                {formatMessageContent(message.content)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={`text-xs mt-1 ${
                          message.type === 'user' ? 'text-indigo-200' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSubmit} className="flex space-x-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about SEOgenix..."
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