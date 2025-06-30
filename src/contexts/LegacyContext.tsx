import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';

interface LegacyAccess {
  id: string;
  ownerName: string;
  ownerId: string;
  accessToken: string;
  capsuleGroupId: string;
  grantedAt: string;
  requiresOwnerDeceased?: boolean;
}

interface LegacyOwner {
  id: string;
  name: string;
  email: string;
  isDeceased: boolean;
  deceasedAt?: string;
  lastActivity?: string;
  lastLifeConfirmation?: string;
  bio?: string;
}

interface LegacyCapsule {
  id: string;
  title: string;
  content: string;
  category: 'passwords' | 'instructions' | 'messages' | 'assets';
  groupId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  unlockRule: any;
  isActive: boolean;
  isUnlocked: boolean;
  accessHistory?: any[];
  selfDestruct?: any;
  priority: string;
}

interface LegacyContextType {
  availableLegacies: LegacyAccess[];
  activeLegacy: LegacyAccess | null;
  legacyOwner: LegacyOwner | null;
  legacyCapsules: LegacyCapsule[];
  activeGroup: any;
  isLoading: boolean;
  error: string | null;
  setActiveLegacy: (legacy: LegacyAccess | null) => void;
  validateLegacyAccess: (token: string) => Promise<LegacyAccess | null>;
  addLegacyAccess: (token: string) => Promise<boolean>;
  removeLegacyAccess: (legacyId: string) => void;
  recordCapsuleAccess: (capsuleId: string, accessMethod?: string) => Promise<void>;
  refreshLegacyData: () => Promise<void>;
}

const LegacyContext = createContext<LegacyContextType | undefined>(undefined);

export const useLegacy = () => {
  const context = useContext(LegacyContext);
  if (context === undefined) {
    throw new Error('useLegacy must be used within a LegacyProvider');
  }
  return context;
};

export const LegacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [availableLegacies, setAvailableLegacies] = useState<LegacyAccess[]>([]);
  const [activeLegacy, setActiveLegacyState] = useState<LegacyAccess | null>(null);
  const [legacyOwner, setLegacyOwner] = useState<LegacyOwner | null>(null);
  const [legacyCapsules, setLegacyCapsules] = useState<LegacyCapsule[]>([]);
  const [activeGroup, setActiveGroup] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved legacies from localStorage on mount
  useEffect(() => {
    const savedLegacies = localStorage.getItem('eternalvault_legacy_access');
    if (savedLegacies) {
      try {
        const parsed = JSON.parse(savedLegacies);
        setAvailableLegacies(parsed);
        console.log('📂 Loaded saved legacies from localStorage:', parsed.length);
      } catch (error) {
        console.error('Error parsing saved legacies:', error);
        localStorage.removeItem('eternalvault_legacy_access');
      }
    }
  }, []);

  const refreshLegacyData = async () => {
    if (!activeLegacy) return;
    
    setIsLoading(true);
    try {
      console.log('🔄 Refreshing legacy data for:', activeLegacy.accessToken.substring(0, 10) + '...');
      
      // Use direct validation - no restrictions
      const response = await supabaseService.validateAccessKeyDirect(activeLegacy.accessToken);
      
      if (response.success && response.data) {
        const { accessKey, owner, group } = response.data;
        
        // Map to legacy format
        const legacyOwnerData: LegacyOwner = {
          id: owner.id,
          name: owner.name,
          email: owner.email,
          isDeceased: false, // Always allow access - no verification
          lastActivity: new Date().toISOString(),
          lastLifeConfirmation: new Date().toISOString()
        };

        const legacyCapsuleData: LegacyCapsule[] = accessKey.capsules.map(capsule => ({
          id: capsule.id,
          title: capsule.title,
          content: capsule.content,
          category: capsule.category,
          groupId: group.id,
          ownerId: capsule.owner_id,
          createdAt: capsule.created_at,
          updatedAt: capsule.updated_at,
          unlockRule: {
            type: capsule.unlock_rule_type,
            days: capsule.unlock_rule_days,
            active: capsule.unlock_rule_active
          },
          isActive: capsule.is_active,
          isUnlocked: true, // Always unlocked for direct access
          selfDestruct: capsule.self_destruct_enabled ? {
            enabled: capsule.self_destruct_enabled,
            maxReads: capsule.self_destruct_max_reads,
            currentReads: capsule.self_destruct_current_reads,
            destroyAfterRead: capsule.self_destruct_destroy_after_read,
            warningMessage: capsule.self_destruct_warning_message
          } : undefined,
          priority: capsule.priority
        }));

        setLegacyOwner(legacyOwnerData);
        setLegacyCapsules(legacyCapsuleData);
        setActiveGroup(group);
        
        console.log('✅ Legacy data refreshed successfully');
      } else {
        setError(response.error || 'Failed to refresh legacy data');
      }
    } catch (error) {
      console.error('Error refreshing legacy data:', error);
      setError('Error refreshing legacy data');
    } finally {
      setIsLoading(false);
    }
  };

  const setActiveLegacy = async (legacy: LegacyAccess | null) => {
    console.log('🎯 Setting active legacy:', legacy ? legacy.ownerName : 'null');
    
    setIsLoading(true);
    setError(null);
    
    try {
      setActiveLegacyState(legacy);
      
      if (legacy) {
        console.log('🔍 Direct access for legacy:', legacy.accessToken.substring(0, 10) + '...');
        
        // Use direct validation - no restrictions
        const response = await supabaseService.validateAccessKeyDirect(legacy.accessToken);
        
        if (response.success && response.data) {
          const { accessKey, owner, group } = response.data;
          
          // Map to legacy format - always allow access
          const legacyOwnerData: LegacyOwner = {
            id: owner.id,
            name: owner.name,
            email: owner.email,
            isDeceased: false, // Always allow access
            lastActivity: new Date().toISOString(),
            lastLifeConfirmation: new Date().toISOString()
          };

          const legacyCapsuleData: LegacyCapsule[] = accessKey.capsules.map(capsule => ({
            id: capsule.id,
            title: capsule.title,
            content: capsule.content,
            category: capsule.category,
            groupId: group.id,
            ownerId: capsule.owner_id,
            createdAt: capsule.created_at,
            updatedAt: capsule.updated_at,
            unlockRule: {
              type: capsule.unlock_rule_type,
              days: capsule.unlock_rule_days,
              active: capsule.unlock_rule_active
            },
            isActive: capsule.is_active,
            isUnlocked: true, // Always unlocked
            selfDestruct: capsule.self_destruct_enabled ? {
              enabled: capsule.self_destruct_enabled,
              maxReads: capsule.self_destruct_max_reads,
              currentReads: capsule.self_destruct_current_reads,
              destroyAfterRead: capsule.self_destruct_destroy_after_read,
              warningMessage: capsule.self_destruct_warning_message
            } : undefined,
            priority: capsule.priority
          }));

          setLegacyOwner(legacyOwnerData);
          setLegacyCapsules(legacyCapsuleData);
          setActiveGroup(group);
          
          console.log('✅ Active legacy set successfully:', {
            owner: legacyOwnerData.name,
            capsules: legacyCapsuleData.length,
            group: group.name
          });
        } else {
          setError(response.error || 'Access key not found');
          setActiveLegacyState(null);
          console.log('❌ Failed to find access key:', response.error);
        }
      } else {
        setLegacyOwner(null);
        setLegacyCapsules([]);
        setActiveGroup(null);
        console.log('✅ Active legacy cleared');
      }
    } catch (error) {
      console.error('Error setting active legacy:', error);
      setError('Error loading legacy');
      setActiveLegacyState(null);
    } finally {
      setIsLoading(false);
    }
  };

  const validateLegacyAccess = async (token: string): Promise<LegacyAccess | null> => {
    console.log('🔍 Validating legacy access for token:', token.substring(0, 10) + '...');
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use direct validation - no restrictions
      const response = await supabaseService.validateAccessKeyDirect(token);
      
      if (response.success && response.data) {
        const { accessKey, owner, group } = response.data;
        
        const legacy: LegacyAccess = {
          id: `access_${accessKey.id}_${Date.now()}`,
          ownerName: owner.name,
          ownerId: owner.id,
          accessToken: token,
          capsuleGroupId: group.id,
          grantedAt: new Date().toISOString(),
          requiresOwnerDeceased: false // No verification needed
        };
        
        console.log('✅ Legacy access validated successfully:', {
          owner: legacy.ownerName,
          group: group.name,
          capsules: accessKey.capsules.length
        });
        
        return legacy;
      } else {
        setError(response.error || 'Access key not found');
        console.log('❌ Legacy access validation failed:', response.error);
        return null;
      }
    } catch (error) {
      console.error('Error validating legacy access:', error);
      setError('Error validating access key');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const addLegacyAccess = async (token: string): Promise<boolean> => {
    console.log('➕ Adding legacy access for token:', token.substring(0, 10) + '...');
    
    const legacy = await validateLegacyAccess(token);
    
    if (legacy) {
      // Check if already exists
      const exists = availableLegacies.find(l => l.accessToken === legacy.accessToken);
      if (exists) {
        setError('Access key already added');
        return false;
      }
      
      const updated = [...availableLegacies, legacy];
      setAvailableLegacies(updated);
      localStorage.setItem('eternalvault_legacy_access', JSON.stringify(updated));
      
      console.log('✅ Legacy access added successfully:', legacy.ownerName);
      return true;
    }
    
    return false;
  };

  const removeLegacyAccess = (legacyId: string) => {
    console.log('🗑️ Removing legacy access:', legacyId);
    
    const updated = availableLegacies.filter(l => l.id !== legacyId);
    setAvailableLegacies(updated);
    localStorage.setItem('eternalvault_legacy_access', JSON.stringify(updated));
    
    if (activeLegacy?.id === legacyId) {
      setActiveLegacy(null);
    }
    
    console.log('✅ Legacy access removed');
  };

  const recordCapsuleAccess = async (capsuleId: string, accessMethod: string = 'chat') => {
    try {
      console.log('📊 Recording capsule access:', { capsuleId, accessMethod });
      
      // Check if capsule exists in our current list
      const capsule = legacyCapsules.find(c => c.id === capsuleId);
      if (!capsule) {
        throw new Error('Capsule not found');
      }

      // Get the access key ID from the active legacy
      const accessKeyId = activeLegacy ? activeLegacy.id.split('_')[1] : undefined;
      
      const response = await supabaseService.recordCapsuleAccess(
        capsuleId, 
        accessKeyId, 
        accessMethod
      );
      
      if (response.capsuleDestroyed) {
        // Remove the capsule from our local state since it was destroyed
        setLegacyCapsules(prev => prev.filter(c => c.id !== capsuleId));

        // Show destruction notification
        setTimeout(() => {
          alert(`🔥 The capsule "${capsule.title}" has been permanently deleted after reaching the read limit.`);
        }, 1000);
        
        console.log('💥 Capsule destroyed:', capsule.title);
      } else {
        // Just update read count
        setLegacyCapsules(prev => prev.map(c => {
          if (c.id === capsuleId && c.selfDestruct?.enabled) {
            return {
              ...c,
              selfDestruct: {
                ...c.selfDestruct,
                currentReads: c.selfDestruct.currentReads + 1
              }
            };
          }
          return c;
        }));
        
        console.log('📊 Capsule read count updated');
      }

      console.log('✅ Capsule access recorded successfully');
    } catch (error) {
      console.error('Error recording capsule access:', error);
      // Don't throw - just log the error and continue
      console.warn('Continuing despite access recording error');
    }
  };

  return (
    <LegacyContext.Provider value={{
      availableLegacies,
      activeLegacy,
      legacyOwner,
      legacyCapsules,
      activeGroup,
      isLoading,
      error,
      setActiveLegacy,
      validateLegacyAccess,
      addLegacyAccess,
      removeLegacyAccess,
      recordCapsuleAccess,
      refreshLegacyData
    }}>
      {children}
    </LegacyContext.Provider>
  );
};