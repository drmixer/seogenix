import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center">
              <Globe className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">SEOgenix</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            <div className="text-sm text-gray-500 mb-6">
              <p><strong>Effective Date:</strong> January 1, 2025</p>
              <p><strong>Last Updated:</strong> January 1, 2025</p>
            </div>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to SEOgenix ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI visibility optimization platform and related services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>Account Information:</strong> Email address, password, and profile information</li>
                <li><strong>Website Information:</strong> URLs, website names, and content you submit for analysis</li>
                <li><strong>Payment Information:</strong> Billing details processed through secure third-party payment processors</li>
                <li><strong>Communication Data:</strong> Messages, support requests, and feedback you send to us</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">2.2 Information We Collect Automatically</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>Usage Data:</strong> How you interact with our platform, features used, and time spent</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
                <li><strong>Analytics Data:</strong> Performance metrics, error logs, and usage patterns</li>
                <li><strong>Cookies and Tracking:</strong> Session data, preferences, and authentication tokens</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">2.3 Information from Third Parties</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Website Analysis:</strong> Publicly available information from websites you submit for analysis</li>
                <li><strong>AI System Data:</strong> Citation and mention data from publicly accessible AI systems and search engines</li>
                <li><strong>Payment Processors:</strong> Transaction confirmations and billing status updates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use your information to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Provide and maintain our AI visibility optimization services</li>
                <li>Analyze your websites and content for AI visibility improvements</li>
                <li>Generate reports, recommendations, and insights</li>
                <li>Process payments and manage your subscription</li>
                <li>Communicate with you about your account and our services</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Improve our platform and develop new features</li>
                <li>Ensure security and prevent fraud or abuse</li>
                <li>Comply with legal obligations and enforce our terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
              <p className="text-gray-700 mb-4">We do not sell your personal information. We may share your information in the following circumstances:</p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">4.1 Service Providers</h3>
              <p className="text-gray-700 mb-4">We work with trusted third-party service providers who help us operate our platform:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>Cloud Infrastructure:</strong> Supabase for database and authentication services</li>
                <li><strong>AI Services:</strong> Google Gemini for content analysis and recommendations</li>
                <li><strong>Payment Processing:</strong> LemonSqueezy for subscription billing</li>
                <li><strong>Analytics:</strong> Usage analytics and performance monitoring services</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">4.2 Legal Requirements</h3>
              <p className="text-gray-700 mb-4">We may disclose your information when required by law or to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Comply with legal processes, court orders, or government requests</li>
                <li>Protect our rights, property, or safety, or that of our users</li>
                <li>Investigate potential violations of our terms of service</li>
                <li>Prevent fraud, security breaches, or other illegal activities</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">4.3 Business Transfers</h3>
              <p className="text-gray-700">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the business transaction. We will notify you of any such change in ownership or control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 mb-4">We implement industry-standard security measures to protect your information:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Encryption:</strong> Data is encrypted in transit and at rest using industry-standard protocols</li>
                <li><strong>Access Controls:</strong> Strict access controls and authentication requirements for our systems</li>
                <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
                <li><strong>Secure Infrastructure:</strong> Hosting on secure, compliant cloud platforms</li>
                <li><strong>Employee Training:</strong> Regular security training for all team members</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
              <p className="text-gray-700 mb-4">We retain your information for as long as necessary to provide our services and comply with legal obligations:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Account Data:</strong> Retained while your account is active and for a reasonable period after deletion</li>
                <li><strong>Website Analysis Data:</strong> Retained to provide historical insights and improve our services</li>
                <li><strong>Usage Analytics:</strong> Aggregated and anonymized data may be retained indefinitely</li>
                <li><strong>Legal Requirements:</strong> Some data may be retained longer to comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights and Choices</h2>
              <p className="text-gray-700 mb-4">You have the following rights regarding your personal information:</p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">7.1 Access and Portability</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Request access to your personal information</li>
                <li>Export your data in a portable format</li>
                <li>Receive copies of your website analysis reports</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">7.2 Correction and Updates</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Update your account information and preferences</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Modify your website information and settings</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">7.3 Deletion and Restriction</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Delete your account and associated data</li>
                <li>Request deletion of specific information</li>
                <li>Restrict processing of your data in certain circumstances</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">7.4 Communication Preferences</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Opt out of marketing communications</li>
                <li>Manage notification preferences</li>
                <li>Control how we contact you about your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 mb-4">We use cookies and similar technologies to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Maintain your login session and preferences</li>
                <li>Analyze usage patterns and improve our platform</li>
                <li>Provide personalized experiences and recommendations</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
              <p className="text-gray-700">
                You can control cookie settings through your browser preferences. However, disabling certain cookies may limit your ability to use some features of our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
              <p className="text-gray-700">
                Our services are hosted and operated in the United States. If you are accessing our platform from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States. We ensure appropriate safeguards are in place for international data transfers in compliance with applicable privacy laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p className="text-gray-700">
                Our platform is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by posting the updated policy on our website and, where appropriate, by email. Your continued use of our platform after any changes indicates your acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> privacy@seogemix.com</p>
                <p className="text-gray-700"><strong>Address:</strong> SEOgenix Privacy Team</p>
                <p className="text-gray-700 ml-16">123 AI Visibility Lane</p>
                <p className="text-gray-700 ml-16">San Francisco, CA 94105</p>
                <p className="text-gray-700 ml-16">United States</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Additional Rights for EU Residents</h2>
              <p className="text-gray-700 mb-4">
                If you are a resident of the European Union, you have additional rights under the General Data Protection Regulation (GDPR):
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Legal Basis:</strong> We process your data based on legitimate interests, contract performance, or consent</li>
                <li><strong>Right to Object:</strong> You can object to processing based on legitimate interests</li>
                <li><strong>Right to Lodge Complaints:</strong> You can file complaints with your local data protection authority</li>
                <li><strong>Data Protection Officer:</strong> Contact our DPO at dpo@seogemix.com for GDPR-related inquiries</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Additional Rights for California Residents</h2>
              <p className="text-gray-700 mb-4">
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Right to Know:</strong> Request information about the categories and specific pieces of personal information we collect</li>
                <li><strong>Right to Delete:</strong> Request deletion of your personal information</li>
                <li><strong>Right to Opt-Out:</strong> Opt out of the sale of personal information (we do not sell personal information)</li>
                <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your privacy rights</li>
              </ul>
              <p className="text-gray-700 mt-4">
                To exercise these rights, please contact us at privacy@seogemix.com with "California Privacy Rights" in the subject line.
              </p>
            </section>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Globe className="h-6 w-6 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">SEOgenix</span>
            </div>
            <div className="text-sm text-gray-500">
              © 2025 SEOgenix. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;