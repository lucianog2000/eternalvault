import React from 'react';
import { X, Key, Shield, AlertTriangle, Clock, Calendar, Activity, Package, Users } from 'lucide-react';
import { useCapsules } from '../../contexts/CapsuleContext';

interface AccessKeyDetailsProps {
  accessKey: any;
  onClose: () => void;
}

const AccessKeyDetails: React.FC<AccessKeyDetailsProps> = ({ accessKey, onClose }) => {
  const isExpired = accessKey.expires_at && new Date(accessKey.expires_at) <= new Date();

  const categoryIcons = {
    passwords: '🔐',
    instructions: '📋',
    messages: '💌',
    assets: '💎'
  };

  const categoryLabels = {
    passwords: 'Passwords and Credentials',
    instructions: 'Instructions',
    messages: 'Personal Messages',
    assets: 'Digital Assets'
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-white/20 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Access Key Group Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg flex items-center justify-center">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{accessKey.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs border bg-green-500/20 text-green-300 border-green-500/40">
                    <Shield className="w-3 h-3" />
                    <span>Active Group</span>
                  </div>
                  {!accessKey.is_active && (
                    <div className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs">
                      Revoked
                    </div>
                  )}
                  {isExpired && (
                    <div className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs">
                      Expired
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Access Key - NEVER SHOWN */}
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Access Key
            </label>
            <div className="bg-black/30 rounded-lg p-4 border border-red-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-red-300" />
                  <code className="text-red-300 font-mono text-lg">
                    ••••••••••••••••••••••••••••••••••••••••
                  </code>
                </div>
                <div className="text-red-300 text-sm font-medium">
                  HIDDEN FOR SECURITY
                </div>
              </div>
            </div>
            <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3 mt-2">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-300 mt-0.5" />
                <div>
                  <p className="text-red-200 font-medium text-sm">🔒 Maximum Security Policy</p>
                  <p className="text-red-200/90 text-xs mt-1">
                    Access keys are NEVER displayed after creation. This is a zero-knowledge security feature. 
                    If you lost the key, you must regenerate it (which will invalidate the old one).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Activity className="w-4 h-4 text-white/60" />
              <div>
                <p className="text-white/80 text-sm">Total Access</p>
                <p className="text-white">{accessKey.access_count}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 text-white/60" />
              <div>
                <p className="text-white/80 text-sm">Created</p>
                <p className="text-white">{new Date(accessKey.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            {accessKey.last_accessed_at && (
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-white/60" />
                <div>
                  <p className="text-white/80 text-sm">Last Access</p>
                  <p className="text-white">{new Date(accessKey.last_accessed_at).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>

          {/* Expiration and Limits */}
          {(accessKey.expires_at || accessKey.max_access_count) && (
            <div className="grid md:grid-cols-2 gap-6">
              {accessKey.expires_at && (
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-4 h-4 text-white/60" />
                  <div>
                    <p className="text-white/80 text-sm">Expires</p>
                    <p className={`${isExpired ? 'text-red-300' : 'text-white'}`}>
                      {new Date(accessKey.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              {accessKey.max_access_count && (
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-white/60" />
                  <div>
                    <p className="text-white/80 text-sm">Access Limit</p>
                    <p className="text-white">
                      {accessKey.access_count} / {accessKey.max_access_count}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Group Information */}
          <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Package className="w-5 h-5 text-blue-300 mt-0.5" />
              <div>
                <p className="text-blue-200 font-medium text-sm">📦 Access Key Group</p>
                <p className="text-blue-200/90 text-xs mt-1">
                  This Access Key defines a group containing {accessKey.capsules?.length || 0} specific capsule{(accessKey.capsules?.length || 0) !== 1 ? 's' : ''}. 
                  Anyone with this key will only see these capsules and nothing else.
                </p>
              </div>
            </div>
          </div>

          {/* Capsules in this Group */}
          <div>
            <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Capsules in this Group ({accessKey.capsules?.length || 0})</span>
            </h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {accessKey.capsules && accessKey.capsules.length > 0 ? (
                accessKey.capsules.map((capsule: any) => (
                  <div
                    key={capsule.id}
                    className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg border border-white/20"
                  >
                    <span className="text-lg mt-0.5">
                      {categoryIcons[capsule.category as keyof typeof categoryIcons]}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="text-white font-medium">{capsule.title}</h5>
                        <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded">
                          {categoryLabels[capsule.category as keyof typeof categoryLabels]}
                        </span>
                        {capsule.self_destruct_enabled && (
                          <span className="text-xs text-orange-300 bg-orange-500/20 px-2 py-1 rounded">
                            🔥 Self-destruct
                          </span>
                        )}
                        {capsule.is_destroyed && (
                          <span className="text-xs text-red-300 bg-red-500/20 px-2 py-1 rounded">
                            💀 Destroyed
                          </span>
                        )}
                      </div>
                      <p className="text-white/80 text-sm line-clamp-2">
                        {capsule.content.length > 150 
                          ? `${capsule.content.substring(0, 150)}...` 
                          : capsule.content
                        }
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-white/30 mx-auto mb-3" />
                  <p className="text-white/70">No capsules assigned to this group</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {accessKey.notes && (
            <div>
              <h4 className="text-white font-medium mb-3">Notes</h4>
              <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                <p className="text-white/90">{accessKey.notes}</p>
              </div>
            </div>
          )}

          {/* Security Information */}
          <div className="bg-purple-500/20 border border-purple-500/40 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Shield className="w-5 h-5 text-purple-300 mt-0.5" />
              <div>
                <p className="text-purple-200 font-medium">Security Information</p>
                <div className="text-purple-200/90 text-sm mt-1 space-y-1">
                  <p>• This key gives access only to the {accessKey.capsules?.length || 0} selected capsules</p>
                  <p>• All access is logged for audit purposes</p>
                  <p>• Can be revoked at any time</p>
                  <p>• The key is encrypted and protected</p>
                  <p>• Key content is never stored or displayed after creation</p>
                  <p>• This Access Key defines its own group - no separate groups needed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessKeyDetails;