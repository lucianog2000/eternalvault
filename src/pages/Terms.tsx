import React from 'react';
import { Shield, FileText, Lock, Heart, AlertTriangle, Scale, Globe, Clock } from 'lucide-react';

const Terms: React.FC = () => {
  const lastUpdated = "December 29, 2024";

  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      icon: FileText,
      content: `By accessing and using EternalVault ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`
    },
    {
      id: "description",
      title: "2. Service Description",
      icon: Heart,
      content: `EternalVault is a digital legacy platform that allows users to create secure capsules containing important information, passwords, messages, and instructions for their loved ones. The service includes AI-powered assistance and granular access control through secure access keys.`
    },
    {
      id: "eligibility",
      title: "3. User Eligibility",
      icon: Shield,
      content: `You must be at least 18 years old to use this service. By using EternalVault, you represent and warrant that you have the legal capacity to enter into this agreement.`
    },
    {
      id: "account",
      title: "4. Account Registration and Security",
      icon: Lock,
      content: `You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. EternalVault cannot and will not be liable for any loss or damage arising from your failure to comply with this security obligation.`
    },
    {
      id: "data-security",
      title: "5. Data Security and Encryption",
      icon: Shield,
      content: `We implement military-grade AES-256 encryption to protect your data. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.`
    },
    {
      id: "life-verification",
      title: "6. Life Verification System",
      icon: Heart,
      content: `Our life verification system monitors user activity to determine when legacy access should be activated. You are responsible for regularly confirming your status through the platform. Failure to do so may result in automatic activation of your legacy capsules according to your configured settings.`
    },
    {
      id: "access-keys",
      title: "7. Access Keys and Legacy Distribution",
      icon: Lock,
      content: `Access keys are generated automatically and are shown only once upon creation. You are solely responsible for the secure storage and distribution of these keys. EternalVault cannot recover lost access keys and is not responsible for unauthorized access resulting from improper key management.`
    },
    {
      id: "content-responsibility",
      title: "8. Content Responsibility",
      icon: FileText,
      content: `You are solely responsible for the content you store in your capsules. You warrant that your content does not violate any laws, infringe on intellectual property rights, or contain harmful, illegal, or offensive material. EternalVault reserves the right to remove content that violates these terms.`
    },
    {
      id: "prohibited-uses",
      title: "9. Prohibited Uses",
      icon: AlertTriangle,
      content: `You may not use EternalVault for: illegal activities, storing malicious software, harassment or threats, copyright infringement, unauthorized access to third-party systems, or any activity that could harm the service or other users.`
    },
    {
      id: "data-retention",
      title: "10. Data Retention and Deletion",
      icon: Clock,
      content: `Your data will be retained according to your account settings and applicable laws. Self-destructing capsules will be permanently deleted according to their configuration. Upon account deletion, your data will be securely removed within 30 days, except where retention is required by law.`
    },
    {
      id: "liability",
      title: "11. Limitation of Liability",
      icon: Scale,
      content: `EternalVault shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.`
    },
    {
      id: "privacy",
      title: "12. Privacy and Data Protection",
      icon: Shield,
      content: `Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information. By using EternalVault, you consent to the collection and use of information in accordance with our Privacy Policy.`
    },
    {
      id: "international",
      title: "13. International Use",
      icon: Globe,
      content: `EternalVault is controlled and operated from the United States. We make no representations that the service is appropriate or available for use in other locations. Users accessing the service from other jurisdictions do so at their own risk and are responsible for compliance with local laws.`
    },
    {
      id: "modifications",
      title: "14. Modifications to Terms",
      icon: FileText,
      content: `We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the platform. Continued use of the service after changes constitutes acceptance of the new terms.`
    },
    {
      id: "termination",
      title: "15. Termination",
      icon: AlertTriangle,
      content: `We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the service will cease immediately.`
    },
    {
      id: "governing-law",
      title: "16. Governing Law",
      icon: Scale,
      content: `These Terms shall be interpreted and governed by the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Any disputes arising from these terms will be resolved in the courts of Delaware.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 lg:py-16">
      <div className="max-w-4xl mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Terms and Conditions
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Please read these terms carefully before using EternalVault. 
            By using our service, you agree to be bound by these terms.
          </p>
          <div className="mt-4 inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20">
            <Clock className="w-4 h-4 text-white/60" />
            <span className="text-white/80 text-sm">Last updated: {lastUpdated}</span>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center space-x-2 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm"
              >
                <section.icon className="w-4 h-4" />
                <span>{section.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div
              key={section.id}
              id={section.id}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 lg:p-8 border border-white/10"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl lg:text-2xl font-bold text-white mb-4">
                    {section.title}
                  </h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-white/80 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Important Notice */}
        <div className="mt-12 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-xl p-6 lg:p-8 border border-orange-300/20">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Important Legal Notice</h3>
              <div className="text-white/80 space-y-2 text-sm lg:text-base">
                <p>
                  <strong>Digital Legacy Responsibility:</strong> EternalVault provides tools for digital legacy management, 
                  but you remain solely responsible for the legal validity and proper execution of your digital estate planning.
                </p>
                <p>
                  <strong>No Legal Advice:</strong> This service does not constitute legal advice. 
                  Consult with qualified legal professionals for estate planning guidance.
                </p>
                <p>
                  <strong>Zero-Knowledge Architecture:</strong> We cannot access your encrypted data or recover lost access keys. 
                  Proper key management is your responsibility.
                </p>
                <p>
                  <strong>Service Availability:</strong> While we strive for 99.9% uptime, we cannot guarantee uninterrupted service. 
                  Consider maintaining backup copies of critical information.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
          <div className="grid md:grid-cols-2 gap-4 text-white/80">
            <div>
              <p className="font-medium text-white mb-2">Legal Questions:</p>
              <p>legal@eternalvault.com</p>
            </div>
            <div>
              <p className="font-medium text-white mb-2">General Support:</p>
              <p>support@eternalvault.com</p>
            </div>
            <div>
              <p className="font-medium text-white mb-2">Mailing Address:</p>
              <p>EternalVault Inc.<br />123 Digital Legacy Blvd<br />San Francisco, CA 94105</p>
            </div>
            <div>
              <p className="font-medium text-white mb-2">Business Hours:</p>
              <p>Monday - Friday<br />9:00 AM - 6:00 PM PST</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm">
            By continuing to use EternalVault, you acknowledge that you have read, 
            understood, and agree to be bound by these Terms and Conditions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;