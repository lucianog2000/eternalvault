import React, { useState } from 'react';
import { Heart, Plus, Key, Trash2, User, Calendar, Shield, Package, ChevronDown, ChevronUp, Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import { useLegacy } from '../../contexts/LegacyContext';

const LegacySelector: React.FC = () => {
  const { 
    availableLegacies, 
    activeLegacy, 
    legacyOwner,
    legacyCapsules,
    activeGroup,
    isLoading,
    error,
    setActiveLegacy, 
    addLegacyAccess, 
    removeLegacyAccess 
  } = useLegacy();
  
  const [showAddToken, setShowAddToken] = useState(false);
  const [newToken, setNewToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [validationSuccess, setValidationSuccess] = useState('');

  const handleAddToken = async () => {
    if (!newToken.trim()) {
      setValidationError('Please enter a valid access key');
      return;
    }

    setIsValidating(true);
    setValidationError('');
    setValidationSuccess('');

    try {
      console.log('🔄 Attempting to add access key:', newToken.substring(0, 10) + '...');
      
      const success = await addLegacyAccess(newToken.trim());
      if (success) {
        setNewToken('');
        setShowAddToken(false);
        setValidationError('');
        setValidationSuccess('Access key added successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setValidationSuccess(''), 3000);
        
        console.log('✅ Access key added successfully');
      } else {
        setValidationError(error || 'Access key not found or already added');
        console.log('❌ Failed to add access key:', error);
      }
    } catch (err) {
      setValidationError('Error validating access key');
      console.error('💥 Exception adding access key:', err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSelectLegacy = (legacy: any) => {
    console.log('🎯 Selecting legacy:', legacy.ownerName);
    setActiveLegacy(legacy);
  };

  const handleDisconnect = () => {
    console.log('🔌 Disconnecting from active legacy');
    setActiveLegacy(null);
  };

  // Show active legacy interface
  if (activeLegacy && legacyOwner && activeGroup) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 lg:p-4 border border-white/10 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm lg:text-base font-semibold text-white">
                Connected: {legacyOwner.name}
              </h3>
              <p className="text-white/70 text-xs lg:text-sm">
                Group: {activeGroup.name} • {(legacyCapsules || []).length} capsule{(legacyCapsules || []).length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="px-2 lg:px-3 py-1 lg:py-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded text-xs lg:text-sm transition-all"
          >
            Disconnect
          </button>
        </div>
        
        {/* Group Description */}
        {activeGroup.description && (
          <div className="mt-3 p-2 lg:p-3 bg-white/5 rounded border border-white/10">
            <p className="text-white/70 text-xs lg:text-sm">{activeGroup.description}</p>
          </div>
        )}

        {/* Success Message */}
        {validationSuccess && (
          <div className="mt-3 p-2 bg-green-500/20 border border-green-500/30 rounded">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-300" />
              <p className="text-green-200 text-xs">{validationSuccess}</p>
            </div>
          </div>
        )}

        {/* Direct Access Notice */}
        <div className="mt-3 p-2 bg-blue-500/20 border border-blue-500/30 rounded">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-300" />
            <p className="text-blue-200 text-xs">
              ✅ <strong>Direct Access:</strong> No verification needed - immediate access to all capsules
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 lg:p-4 border border-white/10 mb-4">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <h3 className="text-sm lg:text-base font-semibold text-white">
          Connect Access Key
        </h3>
        {!showAddToken && (
          <button
            onClick={() => setShowAddToken(true)}
            className="flex items-center space-x-1 text-purple-300 hover:text-purple-200 text-xs lg:text-sm"
          >
            <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
            <span>Add</span>
          </button>
        )}
      </div>

      {/* Success Message */}
      {validationSuccess && (
        <div className="mb-3 p-2 bg-green-500/20 border border-green-500/30 rounded">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-300" />
            <p className="text-green-200 text-xs">{validationSuccess}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader className="w-4 h-4 lg:w-5 lg:h-5 text-purple-300 animate-spin mr-2" />
          <span className="text-white/70 text-xs lg:text-sm">Loading legacy...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isValidating && (
        <div className="bg-red-500/20 border border-red-500/30 rounded p-2 lg:p-3 mb-3 lg:mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-300" />
            <p className="text-red-200 text-xs lg:text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Available Legacies - Compact */}
      {availableLegacies.length > 0 && (
        <div className="space-y-2 mb-3 lg:mb-4">
          {availableLegacies.map((legacy) => (
            <div
              key={legacy.id}
              className="flex items-center justify-between p-2 lg:p-3 bg-white/5 rounded border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
              onClick={() => handleSelectLegacy(legacy)}
            >
              <div className="flex items-center space-x-2">
                <User className="w-3 h-3 lg:w-4 lg:h-4 text-white/50" />
                <div>
                  <p className="text-white text-xs lg:text-sm font-medium">{legacy.ownerName}</p>
                  <p className="text-white/60 text-xs">
                    Direct access • Added {new Date(legacy.grantedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeLegacyAccess(legacy.id);
                }}
                className="p-1 text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Token - Compact */}
      {showAddToken && (
        <div className="space-y-3">
          {validationError && (
            <div className="bg-red-500/20 border border-red-500/30 rounded p-2">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-300" />
                <p className="text-red-200 text-xs">{validationError}</p>
              </div>
            </div>
          )}
          
          <div className="relative">
            <Key className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-white/50" />
            <input
              type="text"
              value={newToken}
              onChange={(e) => setNewToken(e.target.value)}
              placeholder="evault_LCjhMKSvHtMjRyjWSQG0CEALKrENECxxa"
              className="w-full pl-6 lg:pl-8 pr-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs lg:text-sm"
              disabled={isValidating}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddToken();
                }
              }}
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleAddToken}
              disabled={isValidating}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 rounded hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 text-xs lg:text-sm flex items-center justify-center space-x-1"
            >
              {isValidating ? (
                <>
                  <Loader className="w-3 h-3 lg:w-4 lg:h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <span>Connect</span>
              )}
            </button>
            <button
              onClick={() => {
                setShowAddToken(false);
                setNewToken('');
                setValidationError('');
              }}
              className="px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-all text-xs lg:text-sm"
              disabled={isValidating}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Information */}
      <div className="mt-3 p-2 bg-green-500/10 rounded border border-green-500/20">
        <p className="text-green-200 text-xs">
          ✅ <strong>Direct Access:</strong> Access keys work immediately without any verification. 
          Simply enter the key and get instant access to all associated capsules.
        </p>
      </div>

      {/* Demo Keys for Testing */}
      {availableLegacies.length === 0 && !showAddToken && (
        <div className="mt-3 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
          <p className="text-yellow-200 text-xs mb-2">
            🧪 <strong>Demo Keys for Testing:</strong>
          </p>
          <div className="space-y-1 text-xs">
            <p className="text-yellow-200/80">• evault_test_demo_2024_abc123 (Demo capsules)</p>
            <p className="text-yellow-200/80">• evault_sample_key_2024_xyz789 (Sample data)</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegacySelector;