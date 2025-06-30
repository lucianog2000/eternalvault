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

  useEffect(() => {
    const savedLegacies = localStorage.getItem('eternalvault_legacy_access');
    if (savedLegacies) {
      try {
        setAvailableLegacies(JSON.parse(savedLegacies));
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
      const response = await supabaseService.validateAccessToken(activeLegacy.accessToken);
      
      if (response.success && response.data) {
        setLegacyOwner(response.data.owner);
        setLegacyCapsules(response.data.capsules);
        setActiveGroup(response.data.group);
      }
    } catch (error) {
      console.error('Error refreshing legacy data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setActiveLegacy = async (legacy: LegacyAccess | null) => {
    setIsLoading(true);
    setError(null);
    
    try {
      setActiveLegacyState(legacy);
      
      if (legacy) {
        const response = await supabaseService.validateAccessToken(legacy.accessToken);
        
        if (response.success && response.data) {
          setLegacyOwner(response.data.owner);
          setLegacyCapsules(response.data.capsules);
          setActiveGroup(response.data.group);
          
          // Record token usage
          await supabaseService.updateAccessToken(response.data.accessToken.id, {
            currentUses: response.data.accessToken.currentUses + 1
          });
        } else {
          if (response.ownerAlive) {
            setError(`🚫 Access denied: ${response.ownerName} is still alive. This access key only activates after the owner's death.`);
          } else {
            setError(response.error || 'Error loading legacy');
          }
          setActiveLegacyState(null);
        }
      } else {
        setLegacyOwner(null);
        setLegacyCapsules([]);
        setActiveGroup(null);
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
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await supabaseService.validateAccessToken(token);
      
      if (response.success && response.data) {
        const legacy: LegacyAccess = {
          id: `access_${response.data.accessToken.id}_${Date.now()}`,
          ownerName: response.data.owner.name,
          ownerId: response.data.owner.id,
          accessToken: token,
          capsuleGroupId: response.data.group.id,
          grantedAt: new Date().toISOString(),
          requiresOwnerDeceased: response.data.accessToken.requiresOwnerDeceased
        };
        
        return legacy;
      } else {
        if (response.ownerAlive) {
          setError(`🚫 Access denied: ${response.ownerName} is still alive. This access key only activates after the owner's death.`);
        } else {
          setError(response.error || 'Invalid access key');
        }
        return null;
      }
    } catch (error) {
      console.error('Error validating access token:', error);
      setError('Error validating access key');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const addLegacyAccess = async (token: string): Promise<boolean> => {
    const legacy = await validateLegacyAccess(token);
    
    if (legacy && !availableLegacies.find(l => l.accessToken === legacy.accessToken)) {
      const updated = [...availableLegacies, legacy];
      setAvailableLegacies(updated);
      localStorage.setItem('eternalvault_legacy_access', JSON.stringify(updated));
      return true;
    }
    
    return false;
  };

  const removeLegacyAccess = (legacyId: string) => {
    const updated = availableLegacies.filter(l => l.id !== legacyId);
    setAvailableLegacies(updated);
    localStorage.setItem('eternalvault_legacy_access', JSON.stringify(updated));
    
    if (activeLegacy?.id === legacyId) {
      setActiveLegacy(null);
    }
  };

  const recordCapsuleAccess = async (capsuleId: string, accessMethod: string = 'chat') => {
    try {
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
        // Remove the capsule from our local state since it was physically deleted
        setLegacyCapsules(prev => prev.filter(c => c.id !== capsuleId));

        // Show destruction notification
        setTimeout(() => {
          alert(`🔥 The capsule "${capsule.title}" has been permanently deleted after reaching the read limit.`);
        }, 1000);
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
      }

      console.log('📊 CAPSULE ACCESS RECORDED:', {
        capsuleId,
        accessMethod,
        destroyed: response.capsuleDestroyed,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error recording capsule access:', error);
      throw error; // Re-throw to be handled by the calling component
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