import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabaseService, Capsule } from '../services/supabaseService';

interface CapsuleContextType {
  capsules: Capsule[];
  isLoading: boolean;
  error: string | null;
  
  // Capsule operations
  createCapsule: (capsule: Omit<Capsule, 'id' | 'created_at' | 'updated_at' | 'owner_id'>) => Promise<void>;
  updateCapsule: (id: string, updates: Partial<Capsule>) => Promise<void>;
  deleteCapsule: (id: string) => Promise<void>;
  getCapsuleById: (id: string) => Capsule | undefined;
  recordCapsuleAccess: (capsuleId: string, accessMethod?: string) => Promise<void>;
  
  // Utility
  refreshData: () => Promise<void>;
  getUserStats: () => Promise<any>;
}

const CapsuleContext = createContext<CapsuleContextType | undefined>(undefined);

export const useCapsules = () => {
  const context = useContext(CapsuleContext);
  if (context === undefined) {
    throw new Error('useCapsules must be used within a CapsuleProvider');
  }
  return context;
};

export const CapsuleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setCapsules([]);
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const capsulesData = await supabaseService.getCapsules(user.id);
      setCapsules(capsulesData);
    } catch (err) {
      console.error('Error loading capsule data:', err);
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  // ==================== CAPSULE OPERATIONS ====================
  
  const createCapsule = async (capsuleData: Omit<Capsule, 'id' | 'created_at' | 'updated_at' | 'owner_id'>) => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    setError(null);
    
    try {
      const newCapsule = await supabaseService.createCapsule({
        ...capsuleData,
        owner_id: user.id
      });
      
      setCapsules(prev => [newCapsule, ...prev]);
    } catch (err) {
      console.error('Error creating capsule:', err);
      setError(err instanceof Error ? err.message : 'Error creating capsule');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCapsule = async (id: string, updates: Partial<Capsule>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedCapsule = await supabaseService.updateCapsule(id, updates);
      
      setCapsules(prev => prev.map(capsule =>
        capsule.id === id ? updatedCapsule : capsule
      ));
    } catch (err) {
      console.error('Error updating capsule:', err);
      setError(err instanceof Error ? err.message : 'Error updating capsule');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCapsule = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await supabaseService.deleteCapsule(id);
      setCapsules(prev => prev.filter(capsule => capsule.id !== id));
    } catch (err) {
      console.error('Error deleting capsule:', err);
      setError(err instanceof Error ? err.message : 'Error deleting capsule');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getCapsuleById = (id: string) => {
    return capsules.find(capsule => capsule.id === id);
  };

  const recordCapsuleAccess = async (capsuleId: string, accessMethod: string = 'chat') => {
    try {
      const result = await supabaseService.recordCapsuleAccess(capsuleId, undefined, accessMethod);
      
      // Update local state if capsule was destroyed (physically deleted)
      if (result.capsuleDestroyed) {
        setCapsules(prev => prev.filter(capsule => capsule.id !== capsuleId));

        // Show destruction notification
        const capsule = getCapsuleById(capsuleId);
        if (capsule) {
          setTimeout(() => {
            alert(`🔥 The capsule "${capsule.title}" has been permanently deleted after reaching the read limit.`);
          }, 1000);
        }
      } else {
        // Just update read count
        setCapsules(prev => prev.map(capsule => {
          if (capsule.id === capsuleId && capsule.self_destruct_enabled) {
            return {
              ...capsule,
              self_destruct_current_reads: capsule.self_destruct_current_reads + 1
            };
          }
          return capsule;
        }));
      }
    } catch (err) {
      console.error('Error recording capsule access:', err);
    }
  };

  // ==================== UTILITY ====================
  
  const getUserStats = async () => {
    if (!user) return null;
    
    try {
      return await supabaseService.getUserStats(user.id);
    } catch (err) {
      console.error('Error getting user stats:', err);
      return null;
    }
  };

  return (
    <CapsuleContext.Provider value={{
      capsules,
      isLoading,
      error,
      createCapsule,
      updateCapsule,
      deleteCapsule,
      getCapsuleById,
      recordCapsuleAccess,
      refreshData,
      getUserStats
    }}>
      {children}
    </CapsuleContext.Provider>
  );
};