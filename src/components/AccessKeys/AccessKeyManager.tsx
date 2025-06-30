import React, { useState, useEffect } from 'react';
import { Key, Plus, Shield, Eye, Trash2, RotateCcw, AlertTriangle, CheckCircle, Clock, Users, Package, Calendar, Copy } from 'lucide-react';
import { AccessKey, GeneratedAccessKey } from '../../types';
import { supabaseService } from '../../services/supabaseService';
import { useCapsules } from '../../contexts/CapsuleContext';
import { useAuth } from '../../contexts/AuthContext';
import AccessKeyForm from './AccessKeyForm';
import AccessKeyDetails from './AccessKeyDetails';

const AccessKeyManager: React.FC = () => {
  const { user } = useAuth();
  const { capsules } = useCapsules();
  const [accessKeys, setAccessKeys] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAccessKey, setSelectedAccessKey] = useState<any | null>(null);
  const [showKeyDetails, setShowKeyDetails] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<GeneratedAccessKey | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadAccessKeys();
    }
  }, [user]);

  const loadAccessKeys = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔄 Loading access keys from Supabase...');
      const accessKeysData = await supabaseService.getAccessKeys(user.id);
      console.log('✅ Loaded access keys:', accessKeysData);
      setAccessKeys(accessKeysData);
    } catch (error) {
      console.error('❌ Error loading access keys:', error);
      setError(error instanceof Error ? error.message : 'Error loading access keys');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    totalKeys: accessKeys.length,
    activeKeys: accessKeys.filter(ak => ak.is_active).length,
    expiredKeys: accessKeys.filter(ak => 
      ak.expires_at && new Date(ak.expires_at) <= new Date()
    ).length,
    totalAccesses: accessKeys.reduce((sum, ak) => sum + ak.access_count, 0)
  };

  const handleCreateAccessKey = async (request: any) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔧 Creating access key with request:', request);
      
      // Create access key in Supabase (the service will generate the key as ID)
      const accessKeyData = {
        name: request.name,
        owner_id: user.id,
        expires_at: request.expiresAt,
        max_access_count: request.maxAccessCount,
        access_count: 0,
        notes: request.notes,
        is_active: true
      };

      console.log('💾 Saving to Supabase:', accessKeyData);
      const newAccessKey = await supabaseService.createAccessKey(accessKeyData, request.allowedCapsuleIds);
      
      console.log('✅ Access key saved successfully:', newAccessKey);
      
      // Add to local state
      setAccessKeys(prev => [newAccessKey, ...prev]);
      
      // Show the generated key (which is the ID)
      const displayKey = formatKeyForDisplay(newAccessKey.id);
      setGeneratedKey({
        key: newAccessKey.id, // The actual access key is the ID
        displayKey,
        isVisible: true
      });
      setShowCreateForm(false);
      
      console.log('🎉 Access key creation completed successfully');
    } catch (error) {
      console.error('❌ Exception creating access key:', error);
      setError(error instanceof Error ? error.message : 'Error creating access key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeAccessKey = async (accessKeyId: string) => {
    if (!confirm('Are you sure you want to permanently delete this access key? This action cannot be undone and the key will stop working immediately.')) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('🗑️ Deleting access key:', accessKeyId);
      
      await supabaseService.deleteAccessKey(accessKeyId);
      
      setAccessKeys(prev => prev.filter(key => key.id !== accessKeyId));
      
      console.log(`✅ ACCESS KEY PERMANENTLY DELETED: ${accessKeyId}`);
    } catch (error) {
      console.error('❌ Error deleting access key:', error);
      setError(error instanceof Error ? error.message : 'Error deleting access key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateAccessKey = async (accessKeyId: string) => {
    if (!confirm('Are you sure you want to regenerate this key? The previous key will stop working immediately and you will only see the new key once.')) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔄 Regenerating access key:', accessKeyId);
      
      // For regeneration, we need to create a new access key and delete the old one
      const oldAccessKey = accessKeys.find(ak => ak.id === accessKeyId);
      if (!oldAccessKey) {
        throw new Error('Access key not found');
      }

      // Create new access key with same settings
      const newAccessKeyData = {
        name: oldAccessKey.name,
        owner_id: oldAccessKey.owner_id,
        expires_at: oldAccessKey.expires_at,
        max_access_count: oldAccessKey.max_access_count,
        access_count: 0,
        notes: oldAccessKey.notes,
        is_active: true
      };

      // Get capsule IDs from old key
      const capsuleIds = oldAccessKey.capsules?.map((c: any) => c.id) || [];

      // Create new key
      const newAccessKey = await supabaseService.createAccessKey(newAccessKeyData, capsuleIds);
      
      // Delete old key
      await supabaseService.deleteAccessKey(accessKeyId);
      
      // Update local state
      setAccessKeys(prev => prev.map(key =>
        key.id === accessKeyId ? newAccessKey : key
      ));
      
      const displayKey = formatKeyForDisplay(newAccessKey.id);
      setGeneratedKey({
        key: newAccessKey.id,
        displayKey,
        isVisible: true
      });
      
      console.log('✅ Access key regenerated successfully');
    } catch (error) {
      console.error('❌ Exception regenerating access key:', error);
      setError(error instanceof Error ? error.message : 'Error regenerating access key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseGeneratedKey = () => {
    setGeneratedKey(null);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
  };

  const formatKeyForDisplay = (key: string): string => {
    const prefix = 'evault_';
    const keyWithoutPrefix = key.replace(prefix, '');
    
    const groups = [];
    for (let i = 0; i < keyWithoutPrefix.length; i += 8) {
      groups.push(keyWithoutPrefix.substr(i, 8));
    }
    
    return `${prefix}${groups.join('-')}`;
  };

  if (isLoading && accessKeys.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-white/70">Loading access keys...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Key Management</h2>
          <p className="text-white/70">
            Create and manage secure access keys for your legacy capsules. Each key defines a group of capsules.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          disabled={isLoading}
          className="mt-4 md:mt-0 flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          <span>New Access Key</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-300 mt-0.5" />
            <div>
              <p className="text-red-200 font-medium">Error</p>
              <p className="text-red-200/90 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10">
          <div className="flex items-center space-x-2 mb-2">
            <Key className="w-5 h-5 text-blue-300" />
            <span className="text-white/70 text-sm">Active Keys</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalKeys}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-300" />
            <span className="text-white/70 text-sm">Working</span>
          </div>
          <p className="text-2xl font-bold text-green-300">{stats.activeKeys}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-300" />
            <span className="text-white/70 text-sm">Expired</span>
          </div>
          <p className="text-2xl font-bold text-red-300">{stats.expiredKeys}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-5 h-5 text-purple-300" />
            <span className="text-white/70 text-sm">Total Access</span>
          </div>
          <p className="text-2xl font-bold text-purple-300">{stats.totalAccesses}</p>
        </div>
      </div>

      {/* Generated Key Display - ONLY SHOWN ONCE */}
      {generatedKey && generatedKey.isVisible && (
        <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-md rounded-xl p-6 border border-green-300/20">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-lg flex items-center justify-center">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                ✅ Access Key Created Successfully
              </h3>
              <div className="bg-black/30 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <code className="text-green-300 font-mono text-lg break-all">
                    {generatedKey.displayKey}
                  </code>
                  <button
                    onClick={() => handleCopyKey(generatedKey.key)}
                    className="ml-4 p-2 text-green-300 hover:text-green-200 hover:bg-green-500/10 rounded-lg transition-all"
                    title="Copy key"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-300 mt-0.5" />
                  <div>
                    <p className="text-red-200 font-medium">🚨 CRITICAL: Save this key now</p>
                    <p className="text-red-200/80 text-sm mt-1">
                      This is the ONLY time you will see this key. Once you close this window, 
                      it cannot be recovered or viewed again. You are 100% responsible for storing 
                      and distributing this key securely.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleCopyKey(generatedKey.key)}
                  className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Key</span>
                </button>
                <button
                  onClick={handleCloseGeneratedKey}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium"
                >
                  I have saved the key - Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Access Keys List */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Active Access Keys</h3>
            <p className="text-white/60 text-sm">Each key defines a group of capsules for specific access</p>
          </div>
          <div className="text-white/60 text-sm">
            {accessKeys.length} active key{accessKeys.length !== 1 ? 's' : ''}
          </div>
        </div>

        {accessKeys.length === 0 ? (
          <div className="text-center py-8">
            <Key className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/60">No active access keys</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="text-purple-300 hover:text-purple-200 text-sm mt-2 inline-block"
            >
              Create first access key
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {accessKeys.map((accessKey) => {
              const isExpired = accessKey.expires_at && new Date(accessKey.expires_at) <= new Date();
              
              return (
                <div
                  key={accessKey.id}
                  className={`p-4 rounded-lg border transition-all ${
                    !isExpired
                      ? 'bg-white/5 border-white/10 hover:bg-white/10'
                      : 'bg-orange-500/10 border-orange-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-white font-medium">{accessKey.name}</h4>
                        <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs border bg-green-500/20 text-green-300 border-green-500/40">
                          <Shield className="w-3 h-3" />
                          <span>Active</span>
                        </div>
                        {isExpired && (
                          <div className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs">
                            Expired
                          </div>
                        )}
                      </div>
                      
                      {/* Key Display - ALWAYS HIDDEN */}
                      <div className="mb-3">
                        <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Shield className="w-4 h-4 text-white/50" />
                              <span className="text-white/60 text-sm font-mono">
                                Key: ••••••••••••••••••••••••••••••••••••••••
                              </span>
                            </div>
                            <div className="text-white/40 text-xs">
                              Hidden for security
                            </div>
                          </div>
                        </div>
                        <p className="text-white/50 text-xs mt-1">
                          🔒 Access keys are never displayed after creation for maximum security
                        </p>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm text-white/70">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4" />
                          <span>{accessKey.capsules?.length || 0} capsule{(accessKey.capsules?.length || 0) !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{accessKey.access_count} access{accessKey.access_count !== 1 ? 'es' : ''}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>Created: {new Date(accessKey.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {accessKey.last_accessed_at && (
                        <div className="mt-2 text-xs text-white/60">
                          <span>Last access: {new Date(accessKey.last_accessed_at).toLocaleDateString()}</span>
                        </div>
                      )}

                      {accessKey.expires_at && (
                        <div className="mt-2 text-xs text-white/60">
                          <span>Expires: {new Date(accessKey.expires_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedAccessKey(accessKey);
                          setShowKeyDetails(true);
                        }}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {!isExpired && (
                        <button
                          onClick={() => handleRegenerateAccessKey(accessKey.id)}
                          className="p-2 text-blue-300 hover:text-blue-200 hover:bg-blue-500/10 rounded-lg transition-all"
                          title="Regenerate key (old key will stop working)"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleRevokeAccessKey(accessKey.id)}
                        className="p-2 text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete key permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Simplified Information */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-xl p-6 border border-blue-300/20">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">🔑 Simplified Access Keys</h3>
            <div className="text-white/80 space-y-2">
              <p><strong>How it works now:</strong></p>
              <ul className="text-sm space-y-1 text-white/70 ml-4">
                <li>• Access keys are generated as unique IDs (no hashing)</li>
                <li>• Direct database lookup by key ID for instant access</li>
                <li>• No verification needed - immediate access to capsules</li>
                <li>• Perfect for hackathon demo - simple and reliable</li>
              </ul>
              <p className="mt-3"><strong>Benefits:</strong></p>
              <ul className="text-sm space-y-1 text-white/70 ml-4">
                <li>• ✅ No hash inconsistencies</li>
                <li>• ✅ Direct ID-based lookup</li>
                <li>• ✅ Instant access without verification</li>
                <li>• ✅ Simple and reliable for demos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Create Access Key Form */}
      {showCreateForm && (
        <AccessKeyForm
          onSave={handleCreateAccessKey}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Access Key Details Modal */}
      {showKeyDetails && selectedAccessKey && (
        <AccessKeyDetails
          accessKey={selectedAccessKey}
          onClose={() => {
            setShowKeyDetails(false);
            setSelectedAccessKey(null);
          }}
        />
      )}
    </div>
  );
};

export default AccessKeyManager;