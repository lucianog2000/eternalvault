import React from 'react';
import { Package, Users, Clock, Shield, Plus, MessageCircle } from 'lucide-react';
import { useCapsules } from '../contexts/CapsuleContext';
import { useAuth } from '../contexts/AuthContext';
import StatsCard from '../components/Dashboard/StatsCard';
import LifeVerificationWidget from '../components/Dashboard/LifeVerificationWidget';
import EternalLegacyUpgrade from '../components/Dashboard/EternalLegacyUpgrade';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { capsules } = useCapsules();
  const { user } = useAuth();

  const activeCapsules = capsules.filter(c => c.isActive).length;
  const totalRecipients = new Set(capsules.flatMap(c => c.recipients?.map(r => r.email) || [])).size;
  const totalRules = capsules.reduce((sum, c) => sum + (c.unlockRules?.length || 1), 0);

  const recentCapsules = capsules
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
          Welcome, {user?.name}
        </h1>
        <p className="text-white/70">
          Manage your digital legacy and protect what matters most
        </p>
      </div>

      {/* Life Verification Widget */}
      <LifeVerificationWidget />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Active Capsules"
          value={activeCapsules}
          icon={Package}
          color="bg-gradient-to-br from-purple-500 to-blue-500"
          description="Protecting your information"
        />
        <StatsCard
          title="Recipients"
          value={totalRecipients}
          icon={Users}
          color="bg-gradient-to-br from-blue-500 to-cyan-500"
          description="Trusted people"
        />
        <StatsCard
          title="Unlock Rules"
          value={totalRules}
          icon={Clock}
          color="bg-gradient-to-br from-cyan-500 to-teal-500"
          description="Security mechanisms"
        />
        <StatsCard
          title="Security Level"
          value="High"
          icon={Shield}
          color="bg-gradient-to-br from-green-500 to-emerald-500"
          description="AES-256 encryption"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 lg:p-6 border border-white/10">
          <h2 className="text-lg lg:text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/capsules"
              className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg hover:bg-white/15 transition-all group"
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium text-sm lg:text-base">Create New Capsule</p>
                <p className="text-white/60 text-xs lg:text-sm">Protect important information</p>
              </div>
            </Link>
            <Link
              to="/chat"
              className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg hover:bg-white/15 transition-all group"
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium text-sm lg:text-base">Consult AI</p>
                <p className="text-white/60 text-xs lg:text-sm">Ask questions about your legacy</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 lg:p-6 border border-white/10">
          <h2 className="text-lg lg:text-xl font-semibold text-white mb-4">Recent Capsules</h2>
          <div className="space-y-3">
            {recentCapsules.length > 0 ? (
              recentCapsules.map((capsule) => (
                <div key={capsule.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium text-sm lg:text-base">{capsule.title}</p>
                      <p className="text-white/60 text-xs lg:text-sm">
                        {new Date(capsule.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      capsule.isActive 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {capsule.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 lg:py-8">
                <Package className="w-8 h-8 lg:w-12 lg:h-12 text-white/30 mx-auto mb-3" />
                <p className="text-white/60 text-sm">No capsules created yet</p>
                <Link
                  to="/capsules"
                  className="text-purple-300 hover:text-purple-200 text-sm mt-2 inline-block"
                >
                  Create your first capsule
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Eternal Legacy Upgrade */}
      <EternalLegacyUpgrade />

      {/* Security Notice */}
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md rounded-xl p-4 lg:p-6 border border-purple-300/20">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
          </div>
          <div>
            <h3 className="text-base lg:text-lg font-semibold text-white mb-2">Your Information is Secure</h3>
            <p className="text-white/80 mb-3 lg:mb-4 text-sm lg:text-base">
              All your capsules are protected with military-grade AES-256 encryption. 
              Only authorized people will be able to access your information when unlock rules are met.
            </p>
            <div className="grid grid-cols-2 lg:flex lg:items-center lg:space-x-4 gap-2 lg:gap-0 text-xs lg:text-sm text-white/70">
              <span>🔒 End-to-end encryption</span>
              <span>🛡️ Multi-factor authentication</span>
              <span>📋 Complete audit trail</span>
              <span>💓 Automatic life verification</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;