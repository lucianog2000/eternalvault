import React from 'react';
import { Key, Shield, Users, Lock } from 'lucide-react';
import AccessKeyManager from '../components/AccessKeys/AccessKeyManager';

const AccessKeys: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Key className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Access Key Management</h1>
        <p className="text-white/70 max-w-2xl mx-auto">
          Create and manage secure access keys for your legacy capsules. 
          Each key provides specific and controlled access to the capsules you designate.
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Key className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Automatic Generation</h3>
          <p className="text-white/70 text-sm">
            Secure keys generated automatically, impossible to guess
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Granular Access</h3>
          <p className="text-white/70 text-sm">
            Precise control over which specific capsules each person can see
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Manual Distribution</h3>
          <p className="text-white/70 text-sm">
            You decide how and when to share each key with the right people
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Advanced Security</h3>
          <p className="text-white/70 text-sm">
            Automatic expiration, usage limits and instant revocation
          </p>
        </div>
      </div>

      {/* Access Key Manager */}
      <AccessKeyManager />

      {/* Security Information */}
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md rounded-xl p-6 border border-purple-300/20">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">🔐 Access Key Security</h3>
            <div className="grid md:grid-cols-2 gap-4 text-white/80">
              <div>
                <p className="mb-2"><strong>Secure Generation:</strong></p>
                <ul className="text-sm space-y-1 text-white/70">
                  <li>• 40-character keys with high entropy</li>
                  <li>• Impossible to guess or brute force</li>
                  <li>• Format similar to GitHub access keys</li>
                  <li>• Only shown once at creation time</li>
                </ul>
              </div>
              <div>
                <p className="mb-2"><strong>Access Control:</strong></p>
                <ul className="text-sm space-y-1 text-white/70">
                  <li>• Granular access per specific capsule</li>
                  <li>• Usage limits and expiration dates</li>
                  <li>• Instant revocation when needed</li>
                  <li>• Complete audit trail of all access</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessKeys;