import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabaseService, AccessKeyWithCapsules } from '../services/supabaseService';

interface AccessKeyCreationRequest {
  name: string;
  capsuleIds: string[];
  expiresAt?: string;
  maxAccessCount?: number;
  notes?: string;
}

interface GeneratedAccessKey {
  key: string;
  displayKey: string;
  isVisible: boolean;
}

interface AccessKeyContextType {
  accessKeys: AccessKeyWithCapsules[];
  isLoading: boolean;
  error: string | null;
  
  createAccessKey: (request: AccessKeyCreationRequest) => Promise<{ accessKey: AccessKeyWithCapsules; generatedKey: GeneratedAccessKey }>;
  updateAccessKey: (id: string, updates: any) => Promise<void>;
  deleteAccessKey: (id: string) => Promise<void>;
  regenerateAccessKey: (id: string) => Promise<GeneratedAccessKey>;
  validateAccessKey: (key: string) => Promise<AccessKeyWithCapsules | null>;
  
  refreshData: () => Promise<void>;
  getAccessKeyStats: () => any;
}

const AccessKeyContext = createContext<AccessKeyContextType | undefined>(undefined);

export const useAccessKeys = () => {
  const context = useContext(AccessKeyContext);
  if (context === undefined) {
    throw new Error('useAccessKeys must be used within an AccessKeyProvider');
  }
  return context;
};

export const AccessKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [accessKeys, setAccessKeys] = useState<AccessKeyWithCapsules[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setAccessKeys([]);
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await supabaseService.getAccessKeys(user.id);
      setAccessKeys(data);
    } catch (err) {
      console.error('Error loading access keys:', err);
      setError(err instanceof Error ? err.message : 'Error loading access keys');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  const createAccessKey = async (request: AccessKeyCreationRequest) => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    setError(null);
    
    try {
      // Generate the actual key
      const generatedKey = supabaseService.generateAccessKey();
      const keyHash = supabaseService.hashAccessKey(generatedKey);

      // Create access key in database
      const accessKeyData = {
        key_hash: keyHash,
        name: request.name,
        owner_id: user.id,
        expires_at: request.expiresAt,
        max_access_count: request.maxAccessCount,
        access_count: 0,
        notes: request.notes,
        is_active: true
      };

      const newAccessKey = await supabaseService.createAccessKey(accessKeyData, request.capsuleIds);
      
      setAccessKeys(prev => [newAccessKey, ...prev]);

      // Format key for display
      const displayKey = formatKeyForDisplay(generatedKey);

      return {
        accessKey: newAccessKey,
        generatedKey: {
          key: generatedKey,
          displayKey,
          isVisible: true
        }
      };
    } catch (err) {
      console.error('Error creating access key:', err);
      setError(err instanceof Error ? err.message : 'Error creating access key');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAccessKey = async (id: string, updates: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedAccessKey = await supabaseService.updateAccessKey(id, updates);
      
      setAccessKeys(prev => prev.map(ak =>
        ak.id === id ? { ...ak, ...updatedAccessKey } : ak
      ));
    } catch (err) {
      console.error('Error updating access key:', err);
      setError(err instanceof Error ? err.message : 'Error updating access key');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccessKey = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await supabaseService.deleteAccessKey(id);
      setAccessKeys(prev => prev.filter(ak => ak.id !== id));
    } catch (err) {
      console.error('Error deleting access key:', err);
      setError(err instanceof Error ? err.message : 'Error deleting access key');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateAccessKey = async (id: string): Promise<GeneratedAccessKey> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate new key
      const newKey = supabaseService.generateAccessKey();
      const newKeyHash = supabaseService.hashAccessKey(newKey);

      // Update in database
      await supabaseService.updateAccessKey(id, {
        key_hash: newKeyHash,
        access_count: 0,
        last_accessed_at: null,
        last_accessed_from: null
      });

      // Update local state
      setAccessKeys(prev => prev.map(ak =>
        ak.id === id ? { ...ak, access_count: 0, last_accessed_at: null } : ak
      ));

      return {
        key: newKey,
        displayKey: formatKeyForDisplay(newKey),
        isVisible: true
      };
    } catch (err) {
      console.error('Error regenerating access key:', err);
      setError(err instanceof Error ? err.message : 'Error regenerating access key');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const validateAccessKey = async (key: string): Promise<AccessKeyWithCapsules | null> => {
    try {
      const keyHash = supabaseService.hashAccessKey(key);
      return await supabaseService.validateAccessKeyByHash(keyHash);
    } catch (err) {
      console.error('Error validating access key:', err);
      return null;
    }
  };

  const getAccessKeyStats = () => {
    const now = new Date();
    const activeKeys = accessKeys.filter(ak => 
      ak.is_active && (!ak.expires_at || new Date(ak.expires_at) > now)
    );
    const expiredKeys = accessKeys.filter(ak => 
      ak.expires_at && new Date(ak.expires_at) <= now
    );
    const totalAccesses = accessKeys.reduce((sum, ak) => sum + ak.access_count, 0);

    return {
      totalKeys: accessKeys.length,
      activeKeys: activeKeys.length,
      expiredKeys: expiredKeys.length,
      totalAccesses
    };
  };

  // Helper function to format key for display
  const formatKeyForDisplay = (key: string): string => {
    const prefix = 'evault_';
    const keyWithoutPrefix = key.replace(prefix, '');
    
    const groups = [];
    for (let i = 0; i < keyWithoutPrefix.length; i += 8) {
      groups.push(keyWithoutPrefix.substr(i, 8));
    }
    
    return `${prefix}${groups.join('-')}`;
  };

  return (
    <AccessKeyContext.Provider value={{
      accessKeys,
      isLoading,
      error,
      createAccessKey,
      updateAccessKey,
      deleteAccessKey,
      regenerateAccessKey,
      validateAccessKey,
      refreshData,
      getAccessKeyStats
    }}>
      {children}
    </AccessKeyContext.Provider>
  );
};