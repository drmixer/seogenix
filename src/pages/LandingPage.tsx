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
  X
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-b from-primary-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <Globe className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-2xl font-bold gradient-text">SEOgenix</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="button-primary"
                >
                  Start Free
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <motion.h1 
              className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="block">Optimize your content for</span>
              <span className="block gradient-text mt-2">the AI era</span>
            </motion.h1>
            <motion.p 
              className="mt-6 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-8 md:text-xl md:max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Get found by ChatGPT, Perplexity, Siri, and other AI tools. Improve your visibility in the age of AI with comprehensive audits and optimization tools.
            </motion.p>
            <motion.div 
              className="mt-8 max-w-md mx-auto sm:flex sm:justify-center md:mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="rounded-md shadow">
                <Link
                  to="/register"
                  className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:opacity-90 transition-opacity md:py-4 md:text-lg md:px-10"
                >
                  Start Free
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors md:py-4 md:text-lg md:px-10"
                >
                  Log in
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">How It Works</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Boost your AI visibility in three steps
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <motion.div 
                className="card card-hover p-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="h-12 w-12 rounded-md bg-primary-100 text-primary-600 flex items-center justify-center mb-4">
                  <SearchCode size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">1. Analyze</h3>
                <p className="text-gray-500">
                  Add your website and get a comprehensive AI visibility audit, including schema analysis and entity coverage.
                </p>
              </motion.div>

              <motion.div 
                className="card card-hover p-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="h-12 w-12 rounded-md bg-primary-100 text-primary-600 flex items-center justify-center mb-4">
                  <Code2 size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">2. Optimize</h3>
                <p className="text-gray-500">
                  Implement our AI-friendly recommendations, from schema markup to content structure improvements.
                </p>
              </motion.div>

              <motion.div 
                className="card card-hover p-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="h-12 w-12 rounded-md bg-primary-100 text-primary-600 flex items-center justify-center mb-4">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">3. Monitor</h3>
                <p className="text-gray-500">
                  Track your progress with real-time citation monitoring and AI visibility scores.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything you need for AI visibility
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Comprehensive tools to analyze, optimize, and track your content's performance with AI systems.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <BarChart3 size={24} />,
                  title: "AI Visibility Audit",
                  description: "Comprehensive analysis of how well your content performs with AI systems, with actionable recommendations."
                },
                {
                  icon: <Code2 size={24} />,
                  title: "Schema Generator",
                  description: "Create structured data markup that helps AI systems understand your content more effectively."
                },
                {
                  icon: <CheckCircle2 size={24} />,
                  title: "Citation Tracking",
                  description: "Monitor when and where AI systems cite your content, with alerts for new mentions."
                },
                {
                  icon: <Bot size={24} />,
                  title: "Voice Assistant Tester",
                  description: "Test how voice assistants like Siri and Alexa respond to queries about your content."
                },
                {
                  icon: <SearchCode size={24} />,
                  title: "Entity Coverage Analysis",
                  description: "Identify key entities in your content and ensure comprehensive coverage for AI understanding."
                },
                {
                  icon: <MessagesSquare size={24} />,
                  title: "AI Content Generator",
                  description: "Create AI-optimized content snippets, FAQs, and meta descriptions tailored for AI visibility."
                }
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  className="card card-hover p-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="h-12 w-12 rounded-md bg-primary-100 text-primary-600 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-base text-gray-500">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">Pricing</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Choose the right plan for your needs
            </p>
            <p className="mt-4 text-lg text-gray-600">
              Start free and upgrade as you grow. All plans include our core AI visibility features.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Free Plan */}
            <motion.div 
              className="card p-8 border-2 border-green-200 bg-green-50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">Free</h3>
                <p className="mt-4 text-sm text-gray-500">For individuals testing the waters</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">$0</span>
                  <span className="text-base font-medium text-gray-500">/month</span>
                </p>
              </div>
              <ul className="mt-8 space-y-4">
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
                    <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/register" className="button-primary w-full text-center">
                  Start Free
                </Link>
              </div>
            </motion.div>

            {/* Core Plan */}
            <motion.div 
              className="card p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">Core</h3>
                <p className="mt-4 text-sm text-gray-500">For solo creators and small teams</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">$29</span>
                  <span className="text-base font-medium text-gray-500">/month</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">or $261/year (save 25%)</p>
              </div>
              <ul className="mt-8 space-y-4">
                {[
                  { text: "Everything in Free, plus:", included: true },
                  { text: "2 Websites / Projects", included: true },
                  { text: "AI Visibility Audit (2/month, full report)", included: true },
                  { text: "Full Schema Generator access", included: true },
                  { text: "AI Content Generator (20 outputs/month)", included: true },
                  { text: "AI Content Optimizer (up to 10 pages/month)", included: true },
                  { text: "Prompt Match Suggestions (20/month)", included: true },
                  { text: "Citation Tracker (real-time + full sources)", included: true },
                  { text: "Entity Coverage Analyzer", included: true },
                  { text: "Email Support", included: true }
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0" />
                    <span className={`text-sm ${feature.text.includes('Everything') ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/register" className="button-primary w-full text-center">
                  Start Core Plan
                </Link>
              </div>
            </motion.div>

            {/* Pro Plan */}
            <motion.div 
              className="card p-8 relative border-2 border-primary-600"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="absolute top-0 right-0 -translate-y-1/2 px-4 py-1 bg-primary-600 text-white rounded-full text-sm font-medium">
                Most Popular
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">Pro</h3>
                <p className="mt-4 text-sm text-gray-500">For growing brands that want to optimize continuously</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">$59</span>
                  <span className="text-base font-medium text-gray-500">/month</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">or $531/year (save 25%)</p>
              </div>
              <ul className="mt-8 space-y-4">
                {[
                  { text: "Everything in Core, plus:", included: true },
                  { text: "5 Websites / Projects", included: true },
                  { text: "Weekly AI Visibility Audits", included: true },
                  { text: "LLM Site Summaries", included: true },
                  { text: "Voice Assistant Tester (unlimited)", included: true },
                  { text: "AI Content Generator (60 outputs/month)", included: true },
                  { text: "AI Content Optimizer (30 pages/month)", included: true },
                  { text: "Prompt Match Suggestions (60/month)", included: true },
                  { text: "Competitive Analysis (3 competitors)", included: true },
                  { text: "Priority Support", included: true }
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0" />
                    <span className={`text-sm ${feature.text.includes('Everything') ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/register" className="button-primary w-full text-center">
                  Start Pro Plan
                </Link>
              </div>
            </motion.div>

            {/* Agency Plan */}
            <motion.div 
              className="card p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="text-center">
                <h3 className="text-lg font-medium text-white">Agency</h3>
                <p className="mt-4 text-sm text-gray-300">For agencies or power users needing scale</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-white">$99</span>
                  <span className="text-base font-medium text-gray-300">/month</span>
                </p>
                <p className="text-sm text-gray-300 mt-1">or $891/year (save 25%)</p>
              </div>
              <ul className="mt-8 space-y-4">
                {[
                  { text: "Everything in Pro, plus:", included: true },
                  { text: "10 Websites / Projects", included: true },
                  { text: "Daily AI Visibility Audits", included: true },
                  { text: "Unlimited AI Content Generator & Optimizer", included: true },
                  { text: "Unlimited Prompt Match Suggestions", included: true },
                  { text: "Competitive Analysis (10 competitors)", included: true },
                  { text: "Exportable Reports (PDF/CSV)", included: true },
                  { text: "Team Collaboration (up to 5 members)", included: true },
                  { text: "Early Access to New Features", included: true },
                  { text: "Dedicated Support & Onboarding", included: true }
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
                    <span className={`text-sm ${feature.text.includes('Everything') ? 'font-medium text-white' : 'text-gray-300'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/register" className="w-full flex items-center justify-center px-4 py-2 text-base font-medium rounded-lg text-gray-900 bg-white hover:bg-gray-100 transition-colors">
                  Start Agency Plan
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">FAQ</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Frequently asked questions
            </p>
          </div>

          <div className="mt-16 max-w-3xl mx-auto">
            {[
              {
                question: "What is AI visibility?",
                answer: "AI visibility refers to how well AI systems like ChatGPT, Perplexity, and voice assistants can understand, process, and cite your content. Good AI visibility means your content is more likely to be referenced in AI-generated responses."
              },
              {
                question: "How is this different from traditional SEO?",
                answer: "While traditional SEO focuses on search engine rankings, AI visibility optimization ensures your content is properly understood and cited by AI systems. This includes structured data implementation, entity coverage, and semantic clarity that goes beyond traditional SEO practices."
              },
              {
                question: "Can I start with the free plan?",
                answer: "Absolutely! Our free plan includes 1 website, basic AI audits, and essential tools to get you started. You can upgrade anytime as your needs grow."
              },
              {
                question: "How often should I run an AI visibility audit?",
                answer: "We recommend running audits based on your plan: monthly for Free and Core plans, weekly for Pro, and daily for Agency. More frequent audits help you track improvements and catch issues early."
              },
              {
                question: "Can I track when AI systems cite my content?",
                answer: "Yes! Our citation tracking feature monitors when your content is referenced by AI systems, including featured snippets, AI chat responses, and voice assistant answers. You'll receive alerts when new citations are detected."
              },
              {
                question: "Do you offer custom solutions for agencies?",
                answer: "Yes, our Agency plan includes team collaboration, exportable reports, unlimited content generation, and dedicated support perfect for agencies managing multiple clients."
              }
            ].map((faq, index) => (
              <motion.div 
                key={index}
                className="card card-hover p-6 mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                <p className="mt-2 text-gray-500">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 opacity-90"></div>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 relative z-10">
          <div className="lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to boost your AI visibility?</span>
              <span className="block text-primary-200">Start free today, no credit card required.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link
                  to="/register"
                  className="button-secondary"
                >
                  Start Free
                  <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start">
              <div className="flex items-center">
                <Globe className="h-6 w-6 text-primary-600" />
                <span className="ml-2 text-xl font-bold gradient-text">SEOgenix</span>
              </div>
            </div>
            <div className="mt-8 md:mt-0">
              <p className="text-center text-base text-gray-500">
                &copy; 2025 SEOgenix. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;