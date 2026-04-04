// src/pages/privacy-policy-page.tsx

/**
 * Privacy Policy Page
 * 
 * Features:
 * - Comprehensive privacy policy content
 * - Mobile-first responsive design
 * - Clear section organization
 * - Consistent with design system
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { Card, CardBody } from '../design-system/components/card';

export const PrivacyPolicyPage: React.FC = () => {
  // Scroll to specific section when anchor links are clicked
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Offset for sticky header
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const sections = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'information-collection', label: 'Information We Collect' },
    { id: 'information-use', label: 'How We Use Information' },
    { id: 'information-sharing', label: 'Information Sharing' },
    { id: 'cookies', label: 'Cookies & Technologies' },
    { id: 'security', label: 'Data Security' },
    { id: 'your-rights', label: 'Your Rights' },
    { id: 'childrens-privacy', label: 'Children\'s Privacy' },
    { id: 'changes', label: 'Changes to Policy' },
    { id: 'contact', label: 'Contact Us' },
  ];

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col pb-safe-area">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/home"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600"
              >
                <FaArrowLeft />
              </Link>
            </div>

            <div className="text-lg font-bold text-gray-900">Privacy Policy</div>
            <div className="w-10"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Table of Contents - Desktop */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-28 bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-900">Contents</h3>
              </div>
              <div className="p-3">
                <nav className="space-y-1">
                  {sections.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className="block w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-100 text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <Card variant="bottom-sheet" noPadding>
              <CardBody className="sm:p-10 p-6 sm:mb-10 mb-6">
                <div className="border-b border-gray-100 pb-6 mb-8">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Privacy Policy</h1>
                  <p className="text-gray-500 mt-3 font-medium">Last Updated: July 1, 2025</p>
                </div>

                <div className="prose prose-slate max-w-none text-gray-600">
                  <section id="introduction" className="mb-10 scroll-mt-24">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Introduction</h2>
                    <p className="leading-relaxed">
                      Welcome to TelecomSaaS. We respect your privacy and are committed to protecting your personal data.
                      This privacy policy will inform you about how we look after your personal data when you visit our website
                      and tell you about your privacy rights and how the law protects you.
                    </p>
                  </section>

                  <section id="information-collection" className="mb-10 scroll-mt-24">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Information We Collect</h2>
                    <p className="leading-relaxed mb-4">
                      We collect several different types of information for various purposes to provide and improve our service to you:
                    </p>
                    <ul className="space-y-3 bg-gray-50 p-5 rounded-2xl">
                      <li className="flex"><span className="text-primary-500 mr-3 mt-1">•</span><span><strong>Personal Data:</strong> Name, email address, phone number, username, password</span></li>
                      <li className="flex"><span className="text-primary-500 mr-3 mt-1">•</span><span><strong>Usage Data:</strong> IP address, browser type, pages visited, time and date of visit</span></li>
                      <li className="flex"><span className="text-primary-500 mr-3 mt-1">•</span><span><strong>Transaction Data:</strong> Payment details, purchase history, airtime orders</span></li>
                      <li className="flex"><span className="text-primary-500 mr-3 mt-1">•</span><span><strong>Business Information:</strong> For agent accounts, business name, type, and category</span></li>
                    </ul>
                  </section>

                  <section id="information-use" className="mb-10 scroll-mt-24">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">How We Use Information</h2>
                    <p className="leading-relaxed mb-4">We use the collected data for various purposes, including:</p>
                    <ul className="space-y-2 list-disc pl-5 marker:text-primary-400">
                      <li>To provide and maintain our service</li>
                      <li>To notify you about changes to our service</li>
                      <li>To provide customer support</li>
                      <li>To process payments and prevent fraudulent transactions</li>
                      <li>To provide personalized service experience</li>
                      <li>To monitor usage of our service</li>
                      <li>To detect, prevent and address technical issues</li>
                    </ul>
                  </section>

                  <section id="information-sharing" className="mb-10 scroll-mt-24">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Information Sharing</h2>
                    <p className="leading-relaxed mb-4">We may share your personal information in the following situations:</p>
                    <ul className="space-y-3 list-disc pl-5 marker:text-primary-400">
                      <li><strong>With Service Providers:</strong> To facilitate our service, process payments, or perform service-related services.</li>
                      <li><strong>For Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
                      <li><strong>With Affiliates:</strong> With our subsidiaries or affiliated companies.</li>
                      <li><strong>With Your Consent:</strong> After obtaining your explicit permission.</li>
                      <li><strong>For Legal Requirements:</strong> When required by law or to protect our rights.</li>
                    </ul>
                  </section>

                  <section id="cookies" className="mb-10 scroll-mt-24">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Cookies & Technologies</h2>
                    <p className="leading-relaxed">
                      We use cookies and similar tracking technologies to track activity on our service and store certain information.
                      These technologies are used to remember your preferences, improve your experience, and analyze how you use our service.
                    </p>
                    <p className="leading-relaxed mt-4">
                      You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not
                      accept cookies, you may not be able to use some portions of our service.
                    </p>
                  </section>

                  <section id="security" className="mb-10 scroll-mt-24">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Data Security</h2>
                    <p className="leading-relaxed">
                      The security of your data is important to us. We implement appropriate security measures to protect your personal
                      information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission
                      over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                    </p>
                  </section>

                  <section id="your-rights" className="mb-10 scroll-mt-24">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Your Rights</h2>
                    <p className="leading-relaxed mb-4">You have certain data protection rights, including:</p>
                    <ul className="space-y-2 list-disc pl-5 marker:text-primary-400">
                      <li>The right to access, update, or delete your information</li>
                      <li>The right to rectification (to correct inaccurate data)</li>
                      <li>The right to object to our processing of your personal data</li>
                      <li>The right to restriction (request we limit our processing)</li>
                      <li>The right to data portability</li>
                      <li>The right to withdraw consent</li>
                    </ul>
                  </section>

                  <section id="childrens-privacy" className="mb-10 scroll-mt-24">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Children's Privacy</h2>
                    <p className="leading-relaxed text-gray-600 bg-orange-50 border border-orange-100 p-5 rounded-2xl">
                      Our service is not intended for use by children under the age of 18. We do not knowingly collect personally identifiable
                      information from children under 18. If you are a parent or guardian and you are aware that your child has provided us
                      with personal data, please contact us.
                    </p>
                  </section>

                  <section id="changes" className="mb-10 scroll-mt-24">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Changes to This Privacy Policy</h2>
                    <p className="leading-relaxed">
                      We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy
                      on this page and updating the "last updated" date. You are advised to review this Privacy Policy periodically for any changes.
                    </p>
                  </section>

                  <section id="contact" className="mb-4 scroll-mt-24">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Contact Us</h2>
                    <p className="leading-relaxed mb-4">
                      If you have any questions about this Privacy Policy, please contact us:
                    </p>
                    <div className="bg-slate-900 text-white p-6 rounded-[24px]">
                      <ul className="space-y-3">
                        <li className="flex items-center"><span className="text-primary-400 mr-3 font-bold">Email:</span> privacy@telecomsaas.com</li>
                        <li className="flex items-center"><span className="text-primary-400 mr-3 font-bold">Phone:</span> +233 54 898 3019</li>
                        <li className="flex items-center"><span className="text-primary-400 mr-3 font-bold">Mail:</span> P.O. Box 123, Accra, Ghana</li>
                      </ul>
                    </div>
                  </section>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
