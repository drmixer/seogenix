import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bot, 
  BarChart3, 
  Code2, 
  CheckCircle2, 
  SearchCode, 
  MessagesSquare, 
  ArrowRight,
  Globe,
  Check,
  Zap,
  Shield,
  Star,
  X,
  Mic,
  FileText,
  Tag,
  TrendingUp,
  Target,
  Users,
  Building,
  Lightbulb,
  Link2,
  FileBarChart,
  RefreshCw,
  Crown,
  Sparkles
} from 'lucide-react';
import LandingChatbot from '../components/LandingChatbot/LandingChatbot';

const LandingPage = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 animate-gradient-x"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-15 animate-bounce"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between h-20">
            <motion.div 
              className="flex-shrink-0 flex items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            >
              <img 
                src="https://i.imgur.com/bPM4L5Z.png" 
                alt="SEOgenix Logo" 
                className="h-20 w-20 object-contain drop-shadow-lg hover:scale-110 transition-transform duration-300"
              />
            </motion.div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-indigo-50"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-6 py-3 text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Start Free
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 mb-6 shadow-lg">
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                The Future of SEO is AI Visibility
              </span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl tracking-tight font-extrabold text-gray-900 sm:text-6xl md:text-7xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="block">Get Found by</span>
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2 animate-gradient-x">
                AI Systems
              </span>
            </motion.h1>
            
            <motion.p 
              className="mt-8 max-w-md mx-auto text-xl text-gray-600 sm:text-2xl md:mt-10 md:text-2xl md:max-w-4xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Optimize your content for ChatGPT, Perplexity, Claude, Gemini, and voice assistants. 
              <span className="block mt-2 text-lg text-gray-500">
                The comprehensive platform for AI visibility optimization.
              </span>
            </motion.p>
            
            <motion.div 
              className="mt-12 max-w-md mx-auto sm:flex sm:justify-center md:mt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="rounded-lg shadow-xl">
                <Link
                  to="/register"
                  className="w-full flex items-center justify-center px-10 py-4 text-lg font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
                >
                  Start Free Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
              <div className="mt-3 rounded-lg shadow-lg sm:mt-0 sm:ml-4">
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center px-10 py-4 text-lg font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg"
                >
                  Sign In
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="mt-12 flex justify-center items-center space-x-8 text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Free plan available
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Setup in 2 minutes
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Trust Indicators */}
      <section className="py-12 bg-gradient-to-r from-gray-50 to-indigo-50 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-8">
              Optimized for Leading AI Systems
            </p>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
              {[
                { name: 'ChatGPT', logo: '🤖' },
                { name: 'Perplexity', logo: '🔍' },
                { name: 'Claude', logo: '🧠' },
                { name: 'Gemini', logo: '💎' },
                { name: 'Siri', logo: '🎤' },
                { name: 'Alexa', logo: '🔊' }
              ].map((ai, index) => (
                <motion.div
                  key={ai.name}
                  className="flex flex-col items-center p-4 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl mb-2">{ai.logo}</div>
                  <span className="text-sm font-medium text-gray-600">{ai.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">How It Works</h2>
            <p className="mt-2 text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Boost your AI visibility in three steps
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Our comprehensive platform analyzes, optimizes, and monitors your content for maximum AI visibility.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {[
              {
                step: "1",
                icon: <SearchCode size={32} />,
                title: "Analyze & Audit",
                description: "Get comprehensive AI visibility audits including schema analysis, entity coverage, and semantic clarity scoring.",
                features: ["AI Visibility Score", "Schema Markup Analysis", "Entity Coverage Check", "Citation Potential Assessment"],
                gradient: "from-blue-500 to-indigo-600"
              },
              {
                step: "2",
                icon: <Zap size={32} />,
                title: "Optimize & Generate",
                description: "Use our AI-powered tools to create optimized content, schema markup, and structured data.",
                features: ["AI Content Generator", "Schema Generator", "Content Optimizer", "Prompt Suggestions"],
                gradient: "from-purple-500 to-pink-600"
              },
              {
                step: "3",
                icon: <BarChart3 size={32} />,
                title: "Monitor & Track",
                description: "Track your progress with real-time citation monitoring, competitive analysis, and performance insights.",
                features: ["Citation Tracking", "Competitive Analysis", "Voice Assistant Testing", "Performance Monitoring"],
                gradient: "from-green-500 to-teal-600"
              }
            ].map((step, index) => (
              <motion.div 
                key={index}
                className="relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 p-8 group transform hover:-translate-y-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-50 group-hover:opacity-70 transition-all duration-500 group-hover:scale-110"></div>
                
                <div className="relative">
                  <div className="flex items-center mb-6">
                    <div className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-r ${step.gradient} text-white flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {step.icon}
                    </div>
                    <div className="text-4xl font-bold text-gray-200 group-hover:text-gray-300 transition-colors">{step.step}</div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{step.description}</p>
                  
                  <ul className="space-y-2">
                    {step.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Complete Features Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-indigo-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Complete Feature Set</h2>
            <p className="mt-2 text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Everything you need for AI visibility
            </p>
            <p className="mt-4 max-w-3xl text-xl text-gray-500 mx-auto">
              Comprehensive tools to analyze, optimize, and track your content's performance with AI systems and voice assistants.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <BarChart3 size={28} />,
                title: "AI Visibility Audit",
                description: "Comprehensive analysis of how well your content performs with AI systems, with detailed scoring and actionable recommendations.",
                color: "indigo",
                gradient: "from-indigo-500 to-blue-600"
              },
              {
                icon: <TrendingUp size={28} />,
                title: "Competitive Analysis",
                description: "Track and compare your AI visibility performance against competitors in your industry with detailed benchmarking.",
                color: "green",
                gradient: "from-green-500 to-emerald-600"
              },
              {
                icon: <Zap size={28} />,
                title: "AI Content Optimizer",
                description: "Analyze and optimize existing content for better AI understanding and citation potential with real-time scoring.",
                color: "blue",
                gradient: "from-blue-500 to-cyan-600"
              },
              {
                icon: <Code2 size={28} />,
                title: "Schema Generator",
                description: "Create structured data markup that helps AI systems understand your content more effectively with multiple schema types.",
                color: "purple",
                gradient: "from-purple-500 to-violet-600"
              },
              {
                icon: <MessagesSquare size={28} />,
                title: "Prompt Match Suggestions",
                description: "Generate AI-optimized prompts and questions that align with user search intent and voice queries.",
                color: "pink",
                gradient: "from-pink-500 to-rose-600"
              },
              {
                icon: <FileText size={28} />,
                title: "AI Content Generator",
                description: "Create AI-optimized content snippets, FAQs, meta descriptions, and blog outlines tailored for AI visibility.",
                color: "orange",
                gradient: "from-orange-500 to-amber-600"
              },
              {
                icon: <Link2 size={28} />,
                title: "Citation Tracker",
                description: "Monitor when and where AI systems cite your content, with alerts for new mentions across platforms.",
                color: "teal",
                gradient: "from-teal-500 to-cyan-600"
              },
              {
                icon: <Mic size={28} />,
                title: "Voice Assistant Tester",
                description: "Test how voice assistants like Siri, Alexa, and Google Assistant respond to queries about your content.",
                color: "red",
                gradient: "from-red-500 to-pink-600"
              },
              {
                icon: <FileBarChart size={28} />,
                title: "LLM Site Summaries",
                description: "Generate comprehensive, AI-optimized summaries of your website perfect for LLM understanding and citations.",
                color: "yellow",
                gradient: "from-yellow-500 to-orange-600"
              },
              {
                icon: <Tag size={28} />,
                title: "Entity Coverage Analyzer",
                description: "Identify key entities in your content and ensure comprehensive coverage for AI understanding and context.",
                color: "cyan",
                gradient: "from-cyan-500 to-blue-600"
              },
              {
                icon: <Target size={28} />,
                title: "Featured Snippet Optimization",
                description: "Optimize your content structure and format to increase chances of appearing in AI-powered featured snippets.",
                color: "emerald",
                gradient: "from-emerald-500 to-green-600"
              },
              {
                icon: <Crown size={28} />,
                title: "AI Chatbot Assistant",
                description: "Get personalized guidance and insights from Genie, our AI assistant that helps interpret results and suggests improvements.",
                color: "violet",
                gradient: "from-violet-500 to-purple-600"
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 p-6 group transform hover:-translate-y-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <div className={`h-14 w-14 rounded-lg bg-gradient-to-r ${feature.gradient} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Pricing</h2>
            <p className="mt-2 text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Choose the right plan for your needs
            </p>
            <p className="mt-4 text-xl text-gray-600">
              Start free and upgrade as you grow. All plans include our core AI visibility features.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Free Plan */}
            <motion.div 
              className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-green-200 p-8 relative transform hover:-translate-y-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute top-0 right-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                FREE
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900">Free</h3>
                <p className="mt-4 text-sm text-gray-500">For individuals testing the waters</p>
                <p className="mt-8">
                  <span className="text-5xl font-extrabold text-gray-900">$0</span>
                  <span className="text-lg font-medium text-gray-500">/month</span>
                </p>
              </div>
              <ul className="mt-8 space-y-3">
                {[
                  "1 Website / Project",
                  "AI Visibility Audit (1/month, basic)",
                  "Schema Generator (basic types only)",
                  "AI Content Generator (3 outputs/month)",
                  "Prompt Match Suggestions (5/month)",
                  "Citation Tracker (top 3 sources, delayed)",
                  "Community Support"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/register" className="w-full flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                  Start Free
                </Link>
              </div>
            </motion.div>

            {/* Core Plan */}
            <motion.div 
              className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200 p-8 transform hover:-translate-y-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900">Core</h3>
                <p className="mt-4 text-sm text-gray-500">For solo creators and small teams</p>
                <p className="mt-8">
                  <span className="text-5xl font-extrabold text-gray-900">$29</span>
                  <span className="text-lg font-medium text-gray-500">/month</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">or $261/year (save 25%)</p>
              </div>
              <ul className="mt-8 space-y-3">
                {[
                  { text: "Everything in Free, plus:", included: true },
                  { text: "2 Websites / Projects", included: true },
                  { text: "AI Visibility Audit (2/month, full report)", included: true },
                  { text: "Full Schema Generator access", included: true },
                  { text: "AI Content Generator (20 outputs/month)", included: true },
                  { text: "AI Content Optimizer (up to 10 pages/month)", included: true },
                  { text: "Entity Coverage Analyzer", included: true },
                  { text: "AI Chatbot (basic tool guidance)", included: true },
                  { text: "Email Support", included: true }
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0" />
                    <span className={`text-sm ${feature.text.includes('Everything') ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/register" className="w-full flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                  Start Core Plan
                </Link>
              </div>
            </motion.div>

            {/* Pro Plan */}
            <motion.div 
              className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-indigo-600 p-8 relative transform scale-105 hover:scale-110"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 text-sm font-medium rounded-bl-lg">
                Most Popular
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900">Pro</h3>
                <p className="mt-4 text-sm text-gray-500">For growing brands that want to optimize continuously</p>
                <p className="mt-8">
                  <span className="text-5xl font-extrabold text-gray-900">$59</span>
                  <span className="text-lg font-medium text-gray-500">/month</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">or $531/year (save 25%)</p>
              </div>
              <ul className="mt-8 space-y-3">
                {[
                  { text: "Everything in Core, plus:", included: true },
                  { text: "5 Websites / Projects", included: true },
                  { text: "Weekly AI Visibility Audits", included: true },
                  { text: "LLM Site Summaries", included: true },
                  { text: "Voice Assistant Tester (unlimited)", included: true },
                  { text: "AI Content Generator (60 outputs/month)", included: true },
                  { text: "Competitive Analysis (3 competitors)", included: true },
                  { text: "AI Chatbot (full analysis and recommendations)", included: true },
                  { text: "Priority Support", included: true }
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0" />
                    <span className={`text-sm ${feature.text.includes('Everything') ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/register" className="w-full flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                  Start Pro Plan
                </Link>
              </div>
            </motion.div>

            {/* Agency Plan */}
            <motion.div 
              className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden p-8 transform hover:-translate-y-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white">Agency</h3>
                <p className="mt-4 text-sm text-gray-300">For agencies or power users needing scale</p>
                <p className="mt-8">
                  <span className="text-5xl font-extrabold text-white">$99</span>
                  <span className="text-lg font-medium text-gray-300">/month</span>
                </p>
                <p className="text-sm text-gray-300 mt-1">or $891/year (save 25%)</p>
              </div>
              <ul className="mt-8 space-y-3">
                {[
                  { text: "Everything in Pro, plus:", included: true },
                  { text: "10 Websites / Projects", included: true },
                  { text: "Daily AI Visibility Audits", included: true },
                  { text: "Unlimited AI Content Generator & Optimizer", included: true },
                  { text: "Competitive Analysis (10 competitors)", included: true },
                  { text: "Exportable Reports (PDF/CSV)", included: true },
                  { text: "Team Collaboration (up to 5 members)", included: true },
                  { text: "Early Access to New Features", included: true },
                  { text: "Dedicated Support & Onboarding", included: true }
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className={`text-sm ${feature.text.includes('Everything') ? 'font-medium text-white' : 'text-gray-300'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/register" className="w-full flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg text-gray-900 bg-white hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl">
                  Start Agency Plan
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-indigo-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">FAQ</h2>
            <p className="mt-2 text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Frequently asked questions
            </p>
            <p className="mt-4 text-xl text-gray-600">
              Everything you need to know about AI visibility optimization.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {[
              {
                question: "What is AI visibility?",
                answer: "AI visibility refers to how well AI systems like ChatGPT, Perplexity, Claude, and voice assistants can understand, process, and cite your content. Good AI visibility means your content is more likely to be referenced in AI-generated responses and featured in voice assistant answers."
              },
              {
                question: "How is this different from traditional SEO?",
                answer: "While traditional SEO focuses on search engine rankings, AI visibility optimization ensures your content is properly understood and cited by AI systems. This includes structured data implementation, entity coverage, semantic clarity, and voice search optimization that goes beyond traditional SEO practices."
              },
              {
                question: "Can I start with the free plan?",
                answer: "Absolutely! Our free plan includes 1 website, basic AI audits, and essential tools to get you started. You can upgrade anytime as your needs grow, and there's no credit card required to begin."
              },
              {
                question: "How often should I run an AI visibility audit?",
                answer: "We recommend running audits based on your plan: monthly for Free and Core plans, weekly for Pro, and daily for Agency. More frequent audits help you track improvements and catch issues early as AI systems evolve."
              },
              {
                question: "Can I track when AI systems cite my content?",
                answer: "Yes! Our citation tracking feature monitors when your content is referenced by AI systems, including featured snippets, AI chat responses, and voice assistant answers. You'll receive alerts when new citations are detected across multiple platforms."
              },
              {
                question: "What AI systems do you optimize for?",
                answer: "We optimize for all major AI systems including ChatGPT, Perplexity, Claude, Gemini, Siri, Alexa, Google Assistant, and emerging AI platforms. Our optimization techniques work across the entire AI ecosystem."
              },
              {
                question: "Do you offer custom solutions for agencies?",
                answer: "Yes, our Agency plan includes team collaboration, exportable reports, unlimited content generation, competitive analysis for up to 10 competitors, and dedicated support perfect for agencies managing multiple clients."
              },
              {
                question: "How quickly will I see results?",
                answer: "Most users see improvements in their AI Visibility Score within 2-4 weeks of implementing our recommendations. Citation tracking and voice assistant optimization can show results even faster, often within days of making changes."
              }
            ].map((faq, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 p-8 transform hover:-translate-y-1"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.h2 
              className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="block">Ready to dominate</span>
              <span className="block text-indigo-200">the AI era?</span>
            </motion.h2>
            <motion.p 
              className="mt-6 max-w-3xl mx-auto text-xl text-indigo-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Join thousands of businesses already optimizing their content for AI systems. 
              Start free today and see your AI visibility soar.
            </motion.p>
            <motion.div 
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-lg text-indigo-600 bg-white hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
              >
                Start Free Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-lg text-white border-2 border-white hover:bg-white hover:text-indigo-600 transition-all duration-300 hover:shadow-lg"
              >
                Sign In
              </Link>
            </motion.div>
            <motion.div 
              className="mt-8 flex justify-center items-center space-x-8 text-sm text-indigo-200"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-300 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-300 mr-2" />
                Setup in 2 minutes
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-300 mr-2" />
                Cancel anytime
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 text-gray-800">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <motion.div 
                className="flex items-center mb-4"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <img 
                  src="https://i.imgur.com/bPM4L5Z.png" 
                  alt="SEOgenix Logo" 
                  className="h-16 w-16 object-contain drop-shadow-lg"
                />
              </motion.div>
              <p className="text-gray-600 mb-6 max-w-md">
                The comprehensive platform for AI visibility optimization. Get found by ChatGPT, Perplexity, voice assistants, and all major AI systems.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors cursor-pointer">
                  <span className="text-sm">📧</span>
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors cursor-pointer">
                  <span className="text-sm">🐦</span>
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors cursor-pointer">
                  <span className="text-sm">💼</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Product</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Company</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Blog</a></li>
                <li><Link to="/privacy-policy" className="hover:text-gray-900 transition-colors">Privacy</Link></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-300 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              &copy; 2025 SEOgenix. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy-policy" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                Privacy Policy
              </Link>
              <a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Landing Page Chatbot */}
      <LandingChatbot />
    </div>
  );
};

export default LandingPage;