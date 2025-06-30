import React from 'react';
import { Star, Heart, Shield, Key, MessageCircle, ArrowRight, CheckCircle, Users, Clock, Lock, Sparkles, Package, FileText, Mail, Phone, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PoweredByRibbon from '../components/PoweredByRibbon';

const Home: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Shield,
      title: 'Military Security',
      description: 'End-to-end AES-256 encryption to protect your most sensitive information',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Key,
      title: 'Granular Access Keys',
      description: 'Precise control over who accesses what specific information',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Heart,
      title: 'Empathetic AI',
      description: 'Guardian angel that helps your loved ones find what they need',
      color: 'from-pink-500 to-red-500'
    },
    {
      icon: Clock,
      title: 'Smart Unlock',
      description: 'Automatic rules that activate access when needed most',
      color: 'from-green-500 to-teal-500'
    }
  ];

  const problems = [
    {
      icon: Lock,
      title: 'Lost Passwords',
      description: 'Bank accounts, social media and digital services inaccessible forever'
    },
    {
      icon: FileText,
      title: 'Important Documents',
      description: 'Digital wills, insurance policies and legal documents lost'
    },
    {
      icon: Heart,
      title: 'Undelivered Messages',
      description: 'Last words and life advice that never reach their recipients'
    },
    {
      icon: Package,
      title: 'Digital Assets',
      description: 'Cryptocurrencies, NFTs and other digital assets lost forever'
    }
  ];

  const stats = [
    { number: '2.5B', label: 'Digital accounts lost annually', icon: Users },
    { number: '$140B', label: 'In inaccessible digital assets', icon: Package },
    { number: '89%', label: 'Of families without digital legacy plan', icon: Shield },
    { number: '24h', label: 'Average time to lose access after death', icon: Clock }
  ];

  return (
    <div className="space-y-12 lg:space-y-16">
      {/* Hero Section */}
      <section className="text-center py-8 lg:py-16">
        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl lg:rounded-3xl flex items-center justify-center mx-auto mb-6 lg:mb-8">
          <Star className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
        </div>
        
        <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 lg:mb-6 leading-tight px-4">
          Your Digital Legacy
          <br />
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Protected Forever
          </span>
        </h1>
        
        <p className="text-lg lg:text-xl text-white/80 max-w-3xl mx-auto mb-6 lg:mb-8 leading-relaxed px-4">
          EternalVault is the most secure platform to protect and transmit your most important digital information. 
          When you're no longer here, your digital legacy will be safe and accessible to those who need it most.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
          <Link
            to="/chat"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all text-base lg:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6" />
            <span>Chat with Guardian Angel AI</span>
            <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
          </Link>
          
          {!user && (
            <Link
              to="/login"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-md text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl hover:bg-white/20 transition-all text-base lg:text-lg font-semibold border border-white/20"
            >
              <Shield className="w-5 h-5 lg:w-6 lg:h-6" />
              <span>Create My Legacy</span>
            </Link>
          )}
        </div>
        
        <div className="mt-6 lg:mt-8 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-white/60 text-sm px-4">
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Forever safe, so your memory lives on</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Military encryption</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Immediate access for your loved ones</span>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-8 lg:py-16">
        <div className="text-center mb-8 lg:mb-12 px-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
            The Problem No One Sees Coming
          </h2>
          <p className="text-lg lg:text-xl text-white/70 max-w-3xl mx-auto">
            Every day, millions of families permanently lose access to critical digital information. 
            What will happen to your digital legacy when you're no longer here?
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 px-4">
          {problems.map((problem, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-md rounded-xl p-4 lg:p-6 border border-white/10 hover:bg-white/15 transition-all">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center mb-3 lg:mb-4">
                <problem.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <h3 className="text-base lg:text-lg font-semibold text-white mb-2">{problem.title}</h3>
              <p className="text-white/70 text-sm">{problem.description}</p>
            </div>
          ))}
        </div>
        
        {/* Stats */}
        <div className="mt-12 lg:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 px-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2 lg:mb-3">
                <stat.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-white mb-1">{stat.number}</div>
              <div className="text-white/60 text-xs lg:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-8 lg:py-16">
        <div className="text-center mb-8 lg:mb-12 px-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
            The Solution: EternalVault
          </h2>
          <p className="text-lg lg:text-xl text-white/70 max-w-3xl mx-auto">
            A complete platform that protects, organizes and transmits your digital legacy securely and intelligently.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center mb-12 lg:mb-16 px-4">
          <div>
            <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">🔐 Secure Legacy Capsules</h3>
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium text-sm lg:text-base">Passwords and Credentials</p>
                  <p className="text-white/70 text-xs lg:text-sm">Secure access to bank accounts, social media and digital services</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium text-sm lg:text-base">Personal Messages</p>
                  <p className="text-white/70 text-xs lg:text-sm">Last words, life advice and messages of love for each person</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium text-sm lg:text-base">Important Instructions</p>
                  <p className="text-white/70 text-xs lg:text-sm">Processes, document locations and steps to follow</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium text-sm lg:text-base">Digital Assets</p>
                  <p className="text-white/70 text-xs lg:text-sm">Cryptocurrencies, NFTs and other valuable digital assets</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl p-6 lg:p-8 border border-purple-300/20">
            <div className="text-center">
              <Package className="w-12 h-12 lg:w-16 lg:h-16 text-purple-300 mx-auto mb-3 lg:mb-4" />
              <h4 className="text-lg lg:text-xl font-bold text-white mb-2">Example Capsule</h4>
              <div className="bg-black/30 rounded-lg p-3 lg:p-4 text-left">
                <p className="text-green-300 text-xs lg:text-sm font-mono">
                  🔐 Main Bank<br />
                  User: juan.garcia@email.com<br />
                  Password: ••••••••••••<br />
                  PIN: 1985 (year mom was born)
                </p>
              </div>
              <p className="text-white/70 text-xs lg:text-sm mt-3">
                Critical information protected and ready to be transmitted
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center px-4">
          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl p-6 lg:p-8 border border-pink-300/20 order-2 lg:order-1">
            <div className="text-center">
              <Heart className="w-12 h-12 lg:w-16 lg:h-16 text-pink-300 mx-auto mb-3 lg:mb-4" />
              <h4 className="text-lg lg:text-xl font-bold text-white mb-2">Guardian Angel AI</h4>
              <div className="bg-black/30 rounded-lg p-3 lg:p-4 text-left">
                <p className="text-white text-xs lg:text-sm">
                  "Hello María, I'm the guardian angel of Juan's legacy. 
                  He left specific information for you as his wife. 
                  How can I help you today?"
                </p>
              </div>
              <p className="text-white/70 text-xs lg:text-sm mt-3">
                Empathetic AI that guides your loved ones
              </p>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">🤖 Empathetic AI Assistant</h3>
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-start space-x-3">
                <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium text-sm lg:text-base">Natural Conversation</p>
                  <p className="text-white/70 text-xs lg:text-sm">Speaks as if it were your loved one, with empathy and understanding</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Key className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium text-sm lg:text-base">Contextual Access</p>
                  <p className="text-white/70 text-xs lg:text-sm">Only shows relevant information based on relationship and permissions</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium text-sm lg:text-base">Smart Security</p>
                  <p className="text-white/70 text-xs lg:text-sm">Verifies identity and maintains access logs for auditing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 lg:py-16">
        <div className="text-center mb-8 lg:mb-12 px-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
            Key Features
          </h2>
          <p className="text-lg lg:text-xl text-white/70 max-w-3xl mx-auto">
            Cutting-edge technology designed to protect what matters most
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 px-4">
          {features.map((feature, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-md rounded-xl p-4 lg:p-6 border border-white/10 hover:bg-white/15 transition-all group">
              <div className={`w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-3 lg:mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <h3 className="text-base lg:text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-white/70 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-8 lg:py-16">
        <div className="text-center mb-8 lg:mb-12 px-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg lg:text-xl text-white/70 max-w-3xl mx-auto">
            Three simple steps to protect your digital legacy forever
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 px-4">
          <div className="text-center">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 text-white text-xl lg:text-2xl font-bold">
              1
            </div>
            <h3 className="text-lg lg:text-xl font-bold text-white mb-3 lg:mb-4">Create Your Capsules</h3>
            <p className="text-white/70 text-sm lg:text-base">
              Store passwords, messages, instructions and digital assets in secure and encrypted capsules.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 text-white text-xl lg:text-2xl font-bold">
              2
            </div>
            <h3 className="text-lg lg:text-xl font-bold text-white mb-3 lg:mb-4">Configure Access Keys</h3>
            <p className="text-white/70 text-sm lg:text-base">
              Generate specific access keys for each person, controlling exactly what they can see.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 text-white text-xl lg:text-2xl font-bold">
              3
            </div>
            <h3 className="text-lg lg:text-xl font-bold text-white mb-3 lg:mb-4">Automatic Access</h3>
            <p className="text-white/70 text-sm lg:text-base">
              Once the unlock conditions are met, your loved ones will be able to access your legacy through the Guardian Angel — a compassionate AI that delivers your final words.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 lg:py-16">
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl p-6 lg:p-12 border border-purple-300/20 text-center mx-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
            Protect Your Digital Legacy Today
          </h2>
          <p className="text-lg lg:text-xl text-white/70 max-w-2xl mx-auto mb-6 lg:mb-8">
            Don't wait until it's too late. Start protecting your digital information 
            and ensure your loved ones have access to what they need.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/chat"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all text-base lg:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6" />
              <span>Chat with Guardian Angel AI</span>
            </Link>
            
            {!user && (
              <Link
                to="/login"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white text-purple-600 px-6 lg:px-8 py-3 lg:py-4 rounded-xl hover:bg-white/90 transition-all text-base lg:text-lg font-semibold"
              >
                <Star className="w-5 h-5 lg:w-6 lg:h-6" />
                <span>Create Account</span>
              </Link>
            )}
          </div>
          
          <div className="mt-6 lg:mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 text-white/60 text-sm">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span>AES-256 Encryption</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>5-minute setup</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Heart className="w-4 h-4 text-pink-400" />
              <span>Peace of mind forever</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-8 lg:py-16">
        <div className="text-center mb-8 lg:mb-12 px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
            Have Questions?
          </h2>
          <p className="text-base lg:text-lg text-white/70 max-w-2xl mx-auto">
            We're here to help you protect your digital legacy. Contact us for any questions.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto px-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 lg:p-6 border border-white/10">
            <div className="flex items-center space-x-3 mb-3 lg:mb-4">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base lg:text-lg font-semibold text-white">Email</h3>
                <p className="text-white/70 text-sm lg:text-base">support@eternalvault.com</p>
              </div>
            </div>
            <p className="text-white/60 text-xs lg:text-sm">
              Response in less than 24 hours. Technical support and general inquiries.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 lg:p-6 border border-white/10">
            <div className="flex items-center space-x-3 mb-3 lg:mb-4">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Phone className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base lg:text-lg font-semibold text-white">Phone</h3>
                <p className="text-white/70 text-sm lg:text-base">+1 (555) 123-4567</p>
              </div>
            </div>
            <p className="text-white/60 text-xs lg:text-sm">
              Monday to Friday, 9:00 AM - 6:00 PM EST. Priority support for premium users.
            </p>
          </div>
        </div>
      </section>

      {/* Legal Footer */}
      <section className="py-8">
        <div className="text-center px-4">
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 lg:p-6 border border-white/10">
            <p className="text-white/60 text-sm mb-4">
              By using EternalVault, you agree to our terms and conditions. 
              Your privacy and security are our top priorities.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-white/50 text-xs">
              <Link to="/terms" className="hover:text-white transition-colors flex items-center space-x-1">
                <Scale className="w-3 h-3" />
                <span>Terms & Conditions</span>
              </Link>
              <span className="hidden sm:block">•</span>
              <a href="mailto:privacy@eternalvault.com" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <span className="hidden sm:block">•</span>
              <a href="mailto:legal@eternalvault.com" className="hover:text-white transition-colors">
                Legal Information
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Powered By Ribbon - Only on Home */}
      <PoweredByRibbon />
    </div>
  );
};

export default Home;