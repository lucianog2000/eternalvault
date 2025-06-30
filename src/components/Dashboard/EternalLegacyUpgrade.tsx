import React, { useState } from 'react';
import { Crown, Star, Shield, Key, Heart, Check, X, Zap, Package, Users, Clock, Infinity, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const EternalLegacyUpgrade: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Use Supabase user ID for RevenueCat integration
  const getUserId = (): string => {
    if (user?.id) return user.id;
    
    // Fallback for non-authenticated users (shouldn't happen in this component)
    let persistentId = localStorage.getItem('eternalvault_persistent_user_id');
    if (!persistentId) {
      persistentId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('eternalvault_persistent_user_id', persistentId);
    }
    return persistentId;
  };

  // Build RevenueCat purchase link with Supabase user ID
  const handleUpgrade = () => {
    setIsLoading(true);
    
    const userId = getUserId();
    const payUrl = `https://pay.rev.cat/sandbox/hkjtatkimhomghyz/${userId}`;
    
    console.log('🚀 Redirecting to RevenueCat payment:', {
      userId,
      payUrl,
      supabaseUser: !!user,
      userEmail: user?.email
    });
    
    // Open payment link in new window
    window.open(payUrl, '_blank', 'noopener,noreferrer');
    
    // Reset loading after a moment
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const freeFeatures = [
    { name: 'Up to 5 legacy capsules', included: true },
    { name: 'Basic AI assistant', included: true },
    { name: 'Standard encryption', included: true },
    { name: 'Email support', included: true },
    { name: 'Basic access keys', included: true },
    { name: 'Unlimited capsules', included: false },
    { name: 'Advanced AI features', included: false },
    { name: 'Priority support', included: false },
    { name: 'Advanced security', included: false },
    { name: 'Family collaboration', included: false },
    { name: 'Custom branding', included: false },
    { name: 'API access', included: false }
  ];

  const premiumFeatures = [
    { name: 'Unlimited legacy capsules', highlight: true },
    { name: 'Advanced AI guardian angel', highlight: true },
    { name: 'Military-grade encryption+', highlight: true },
    { name: 'Priority 24/7 support', highlight: true },
    { name: 'Advanced access key management', highlight: true },
    { name: 'Family collaboration tools', highlight: true },
    { name: 'Custom branding options', highlight: false },
    { name: 'API access for integrations', highlight: false },
    { name: 'Advanced analytics', highlight: false },
    { name: 'White-label solutions', highlight: false },
    { name: 'Dedicated account manager', highlight: false },
    { name: 'SLA guarantees', highlight: false }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Upgrade to Eternal Legacy</h2>
            <p className="text-white/70 text-sm">Unlock unlimited features for your digital legacy</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">$9.99</div>
          <div className="text-white/60 text-sm">per month</div>
        </div>
      </div>

      {/* Plan Comparison */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Free Plan */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center space-x-2 mb-4">
            <Package className="w-5 h-5 text-blue-300" />
            <h3 className="text-lg font-semibold text-white">Free Plan</h3>
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">Current</span>
          </div>
          <div className="space-y-2">
            {freeFeatures.slice(0, 6).map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                {feature.included ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <X className="w-4 h-4 text-red-400" />
                )}
                <span className={`text-sm ${feature.included ? 'text-white/80' : 'text-white/40'}`}>
                  {feature.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Plan */}
        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-300/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
            PREMIUM
          </div>
          <div className="flex items-center space-x-2 mb-4">
            <Crown className="w-5 h-5 text-yellow-300" />
            <h3 className="text-lg font-semibold text-white">Eternal Legacy</h3>
          </div>
          <div className="space-y-2">
            {premiumFeatures.slice(0, 6).map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-yellow-400" />
                <span className={`text-sm ${feature.highlight ? 'text-yellow-200 font-medium' : 'text-white/80'}`}>
                  {feature.name}
                </span>
                {feature.highlight && <Star className="w-3 h-3 text-yellow-400" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-4 mb-6 border border-purple-300/20">
        <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <span>Why Upgrade to Eternal Legacy?</span>
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start space-x-2">
            <Infinity className="w-4 h-4 text-blue-300 mt-0.5" />
            <div>
              <p className="text-white font-medium">Unlimited Capsules</p>
              <p className="text-white/70">Create as many legacy capsules as you need</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Heart className="w-4 h-4 text-pink-300 mt-0.5" />
            <div>
              <p className="text-white font-medium">Advanced AI Guardian</p>
              <p className="text-white/70">More empathetic and intelligent responses</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Shield className="w-4 h-4 text-green-300 mt-0.5" />
            <div>
              <p className="text-white font-medium">Enhanced Security</p>
              <p className="text-white/70">Additional layers of protection</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Users className="w-4 h-4 text-purple-300 mt-0.5" />
            <div>
              <p className="text-white font-medium">Family Collaboration</p>
              <p className="text-white/70">Work together on legacy planning</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Info Display */}
      {user && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-green-300" />
            <span className="text-green-200 font-medium">Authenticated User</span>
          </div>
          <div className="text-green-200/90 text-sm space-y-1">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>User ID:</strong> {user.id.substring(0, 8)}...{user.id.substring(-4)}</p>
            <p><strong>Member since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      )}

      {/* Upgrade Button */}
      <div className="text-center">
        <button
          onClick={handleUpgrade}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold py-4 px-6 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              <span>Opening payment...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Upgrade to Eternal Legacy</span>
              <Crown className="w-5 h-5" />
            </>
          )}
        </button>
        
        <div className="mt-4 flex items-center justify-center space-x-4 text-white/60 text-xs">
          <div className="flex items-center space-x-1">
            <Shield className="w-3 h-3" />
            <span>Secure payment</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="w-3 h-3" />
            <span>30-day guarantee</span>
          </div>
        </div>
        
        <p className="text-white/50 text-xs mt-2">
          Powered by RevenueCat • User ID: {getUserId().substring(0, 12)}...
        </p>
      </div>

      {/* Additional Features */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <h4 className="text-white font-medium mb-3">All Premium Features Include:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {[
            'Unlimited storage',
            'Advanced encryption',
            'Priority support',
            'Family sharing',
            'Custom domains',
            'API access',
            'Analytics dashboard',
            'White-label options',
            'SLA guarantees'
          ].map((feature, index) => (
            <div key={index} className="flex items-center space-x-1 text-white/70">
              <Check className="w-3 h-3 text-green-400" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EternalLegacyUpgrade;