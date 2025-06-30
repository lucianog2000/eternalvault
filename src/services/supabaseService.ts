import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

// Type definitions for our entities
export interface Capsule {
  id: string;
  title: string;
  content: string;
  category: 'passwords' | 'instructions' | 'messages' | 'assets';
  owner_id: string;
  unlock_rule_type: string;
  unlock_rule_days: number;
  unlock_rule_active: boolean;
  self_destruct_enabled: boolean;
  self_destruct_max_reads: number;
  self_destruct_current_reads: number;
  self_destruct_destroy_after_read: boolean;
  self_destruct_warning_message?: string;
  is_active: boolean;
  is_unlocked: boolean;
  is_destroyed: boolean;
  destroyed_at?: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export interface AccessKey {
  id: string;
  key_hash: string;
  name: string;
  owner_id: string;
  expires_at?: string;
  max_access_count?: number;
  access_count: number;
  last_accessed_at?: string;
  last_accessed_from?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccessKeyWithCapsules extends AccessKey {
  capsules: Capsule[];
  owner_name?: string; // Add owner name for display
}

export interface CapsuleAccessRecord {
  id: string;
  capsule_id: string;
  access_key_id?: string;
  accessed_by_user_id?: string;
  access_method: string;
  ip_address?: string;
  user_agent?: string;
  accessed_at: string;
}

class SupabaseService {
  // ==================== CAPSULES ====================
  
  async getCapsules(userId: string): Promise<Capsule[]> {
    const { data, error } = await supabase
      .from('capsules')
      .select('*')
      .eq('owner_id', userId)
      .eq('is_destroyed', false) // Only get non-destroyed capsules
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching capsules:', error);
      throw new Error(error.message);
    }

    return data || [];
  }

  async getCapsuleById(id: string): Promise<Capsule | null> {
    const { data, error } = await supabase
      .from('capsules')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching capsule:', error);
      throw new Error(error.message);
    }

    return data;
  }

  async createCapsule(capsule: Omit<Capsule, 'id' | 'created_at' | 'updated_at'>): Promise<Capsule> {
    const { data, error } = await supabase
      .from('capsules')
      .insert(capsule)
      .select()
      .single();

    if (error) {
      console.error('Error creating capsule:', error);
      throw new Error(error.message);
    }

    return data;
  }

  async updateCapsule(id: string, updates: Partial<Capsule>): Promise<Capsule> {
    const { data, error } = await supabase
      .from('capsules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating capsule:', error);
      throw new Error(error.message);
    }

    return data;
  }

  async deleteCapsule(id: string): Promise<void> {
    const { error } = await supabase
      .from('capsules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting capsule:', error);
      throw new Error(error.message);
    }
  }

  // Soft delete method for destroyed capsules
  async destroyCapsule(id: string): Promise<Capsule> {
    const updates: Partial<Capsule> = {
      is_destroyed: true,
      destroyed_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('capsules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error destroying capsule:', error);
      throw new Error(error.message);
    }

    return data;
  }

  // ==================== ACCESS KEYS ====================
  
  async getAccessKeys(userId: string): Promise<AccessKeyWithCapsules[]> {
    // First get access keys with owner profile information
    const { data: accessKeys, error: keysError } = await supabase
      .from('access_keys')
      .select(`
        *,
        profiles!access_keys_owner_id_fkey (
          full_name
        )
      `)
      .eq('owner_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (keysError) {
      console.error('Error fetching access keys:', keysError);
      throw new Error(keysError.message);
    }

    if (!accessKeys || accessKeys.length === 0) {
      return [];
    }

    // Get capsules for each access key
    const accessKeysWithCapsules: AccessKeyWithCapsules[] = [];

    for (const accessKey of accessKeys) {
      const { data: capsuleRelations, error: relationsError } = await supabase
        .from('access_key_capsules')
        .select(`
          capsule_id,
          capsules (*)
        `)
        .eq('access_key_id', accessKey.id);

      if (relationsError) {
        console.error('Error fetching capsule relations:', relationsError);
        continue;
      }

      const capsules = capsuleRelations?.map(rel => rel.capsules).filter(Boolean) || [];

      accessKeysWithCapsules.push({
        ...accessKey,
        capsules: capsules as Capsule[],
        owner_name: accessKey.profiles?.full_name || 'Unknown User'
      });
    }

    return accessKeysWithCapsules;
  }

  async createAccessKey(
    accessKey: Omit<AccessKey, 'id' | 'created_at' | 'updated_at'>,
    capsuleIds: string[]
  ): Promise<AccessKeyWithCapsules> {
    // Create the access key
    const { data: newAccessKey, error: keyError } = await supabase
      .from('access_keys')
      .insert(accessKey)
      .select()
      .single();

    if (keyError) {
      console.error('Error creating access key:', keyError);
      throw new Error(keyError.message);
    }

    // Create relationships with capsules
    if (capsuleIds.length > 0) {
      const relations = capsuleIds.map(capsuleId => ({
        access_key_id: newAccessKey.id,
        capsule_id: capsuleId
      }));

      const { error: relationsError } = await supabase
        .from('access_key_capsules')
        .insert(relations);

      if (relationsError) {
        console.error('Error creating capsule relations:', relationsError);
        // Clean up the access key if relations failed
        await this.deleteAccessKey(newAccessKey.id);
        throw new Error(relationsError.message);
      }
    }

    // Get the capsules for the response
    const capsules = await this.getCapsulesByIds(capsuleIds);

    // Get owner name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', newAccessKey.owner_id)
      .single();

    return {
      ...newAccessKey,
      capsules,
      owner_name: profile?.full_name || 'Unknown User'
    };
  }

  async updateAccessKey(id: string, updates: Partial<AccessKey>): Promise<AccessKey> {
    const { data, error } = await supabase
      .from('access_keys')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating access key:', error);
      throw new Error(error.message);
    }

    return data;
  }

  async deleteAccessKey(id: string): Promise<void> {
    // Relations will be deleted automatically due to CASCADE
    const { error } = await supabase
      .from('access_keys')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting access key:', error);
      throw new Error(error.message);
    }
  }

  async validateAccessKeyByHash(keyHash: string): Promise<AccessKeyWithCapsules | null> {
    const { data: accessKeys, error } = await supabase
      .from('access_keys')
      .select(`
        *,
        profiles!access_keys_owner_id_fkey (
          full_name
        )
      `)
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .limit(1);

    if (error) {
      console.error('Error validating access key:', error);
      throw new Error(error.message);
    }

    if (!accessKeys || accessKeys.length === 0) {
      return null; // Not found
    }

    const accessKey = accessKeys[0];

    // Check if expired
    if (accessKey.expires_at && new Date(accessKey.expires_at) <= new Date()) {
      return null;
    }

    // Check access count limit
    if (accessKey.max_access_count && accessKey.access_count >= accessKey.max_access_count) {
      return null;
    }

    // Get associated capsules
    const { data: capsuleRelations, error: relationsError } = await supabase
      .from('access_key_capsules')
      .select(`
        capsule_id,
        capsules (*)
      `)
      .eq('access_key_id', accessKey.id);

    if (relationsError) {
      console.error('Error fetching capsule relations:', relationsError);
      throw new Error(relationsError.message);
    }

    const capsules = capsuleRelations?.map(rel => rel.capsules).filter(Boolean) || [];

    return {
      ...accessKey,
      capsules: capsules as Capsule[],
      owner_name: accessKey.profiles?.full_name || 'Unknown User'
    };
  }

  // ==================== CAPSULE ACCESS ====================
  
  async recordCapsuleAccess(
    capsuleId: string,
    accessKeyId?: string,
    accessMethod: string = 'chat',
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ accessRecord: CapsuleAccessRecord; capsuleDestroyed: boolean }> {
    console.log('🔍 Recording capsule access:', { capsuleId, accessKeyId, accessMethod });
    
    const { data: user } = await supabase.auth.getUser();
    
    // Get current capsule to check self-destruction BEFORE creating access record
    const capsule = await this.getCapsuleById(capsuleId);
    if (!capsule) {
      throw new Error('Capsule not found');
    }

    // Check if capsule is already destroyed
    if (capsule.is_destroyed) {
      throw new Error('Capsule has been destroyed and is no longer accessible');
    }

    console.log('📋 Current capsule state:', {
      id: capsule.id,
      title: capsule.title,
      self_destruct_enabled: capsule.self_destruct_enabled,
      self_destruct_current_reads: capsule.self_destruct_current_reads,
      self_destruct_max_reads: capsule.self_destruct_max_reads,
      is_destroyed: capsule.is_destroyed
    });

    let capsuleDestroyed = false;
    let updatedCapsule = capsule;

    // Handle self-destruction FIRST
    if (capsule.self_destruct_enabled) {
      const newReadCount = capsule.self_destruct_current_reads + 1;
      
      console.log('🔥 Processing self-destruction:', {
        currentReads: capsule.self_destruct_current_reads,
        newReadCount,
        maxReads: capsule.self_destruct_max_reads,
        destroyAfterRead: capsule.self_destruct_destroy_after_read
      });
      
      // Check if should be destroyed (soft delete)
      if (newReadCount >= capsule.self_destruct_max_reads && capsule.self_destruct_destroy_after_read) {
        capsuleDestroyed = true;
        
        console.log('💥 CAPSULE WILL BE SOFT DELETED:', {
          capsuleId,
          title: capsule.title,
          finalReadCount: newReadCount,
          maxReads: capsule.self_destruct_max_reads
        });

        // Create access record BEFORE destroying capsule
        const accessRecord = {
          capsule_id: capsuleId,
          access_key_id: accessKeyId,
          accessed_by_user_id: user.user?.id,
          access_method: accessMethod,
          ip_address: ipAddress,
          user_agent: userAgent
        };

        const { data: newAccessRecord, error: accessError } = await supabase
          .from('capsule_access_history')
          .insert(accessRecord)
          .select()
          .single();

        if (accessError) {
          console.error('Error recording capsule access:', accessError);
          throw new Error(accessError.message);
        }

        // Now soft delete the capsule (mark as destroyed)
        await this.destroyCapsule(capsuleId);
        
        console.log('✅ Capsule marked as destroyed in database');

        return {
          accessRecord: newAccessRecord,
          capsuleDestroyed: true
        };
      } else {
        // Just update read count
        const updates: Partial<Capsule> = {
          self_destruct_current_reads: newReadCount
        };

        updatedCapsule = await this.updateCapsule(capsuleId, updates);
        
        console.log('✅ Capsule read count updated:', {
          id: updatedCapsule.id,
          self_destruct_current_reads: updatedCapsule.self_destruct_current_reads
        });
      }
    }

    // Create access record for non-destroyed capsules
    const accessRecord = {
      capsule_id: capsuleId,
      access_key_id: accessKeyId,
      accessed_by_user_id: user.user?.id,
      access_method: accessMethod,
      ip_address: ipAddress,
      user_agent: userAgent
    };

    const { data: newAccessRecord, error: accessError } = await supabase
      .from('capsule_access_history')
      .insert(accessRecord)
      .select()
      .single();

    if (accessError) {
      console.error('Error recording capsule access:', accessError);
      throw new Error(accessError.message);
    }

    console.log('📊 Access recorded successfully:', {
      accessRecordId: newAccessRecord.id,
      capsuleDestroyed,
      accessMethod
    });

    return {
      accessRecord: newAccessRecord,
      capsuleDestroyed
    };
  }

  async getCapsuleAccessHistory(capsuleId: string): Promise<CapsuleAccessRecord[]> {
    const { data, error } = await supabase
      .from('capsule_access_history')
      .select('*')
      .eq('capsule_id', capsuleId)
      .order('accessed_at', { ascending: false });

    if (error) {
      console.error('Error fetching capsule access history:', error);
      throw new Error(error.message);
    }

    return data || [];
  }

  // ==================== UTILITY METHODS ====================
  
  private async getCapsulesByIds(ids: string[]): Promise<Capsule[]> {
    if (ids.length === 0) return [];

    const { data, error } = await supabase
      .from('capsules')
      .select('*')
      .in('id', ids)
      .eq('is_destroyed', false); // Only get non-destroyed capsules

    if (error) {
      console.error('Error fetching capsules by IDs:', error);
      throw new Error(error.message);
    }

    return data || [];
  }

  // Hash function for access keys (simple implementation)
  hashAccessKey(key: string): string {
    // In production, use a proper hashing library like bcrypt
    // This is a simple implementation for demo purposes
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  // Generate secure access key
  generateAccessKey(): string {
    const prefix = 'evault_';
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const keyLength = 35; // Total length will be ~42 with prefix
    
    let key = prefix;
    for (let i = 0; i < keyLength; i++) {
      key += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return key;
  }

  // Get user statistics
  async getUserStats(userId: string) {
    const [capsules, accessKeys] = await Promise.all([
      this.getCapsules(userId),
      this.getAccessKeys(userId)
    ]);

    return {
      totalCapsules: capsules.length,
      activeCapsules: capsules.filter(c => c.is_active).length,
      totalAccessKeys: accessKeys.length,
      activeAccessKeys: accessKeys.filter(ak => ak.is_active).length,
      capsulesByCategory: {
        passwords: capsules.filter(c => c.category === 'passwords').length,
        messages: capsules.filter(c => c.category === 'messages').length,
        instructions: capsules.filter(c => c.category === 'instructions').length,
        assets: capsules.filter(c => c.category === 'assets').length
      }
    };
  }

  // ==================== LEGACY COMPATIBILITY METHODS ====================
  // These methods provide compatibility with the old API for legacy context

  async validateAccessToken(token: string) {
    try {
      // Hash the token to find it in the database
      const keyHash = this.hashAccessKey(token);
      const accessKeyWithCapsules = await this.validateAccessKeyByHash(keyHash);
      
      if (!accessKeyWithCapsules) {
        return {
          data: null,
          success: false,
          error: 'Invalid or expired access key'
        };
      }

      // Create a virtual group for compatibility
      const virtualGroup = {
        id: `virtual_group_${accessKeyWithCapsules.id}`,
        name: accessKeyWithCapsules.name,
        description: accessKeyWithCapsules.notes || `Access to ${accessKeyWithCapsules.capsules.length} specific capsules`,
        ownerId: accessKeyWithCapsules.owner_id,
        createdAt: accessKeyWithCapsules.created_at,
        category: 'access_key',
        priority: 'high'
      };

      // Create a virtual owner for compatibility using the access key owner info
      const virtualOwner = {
        id: accessKeyWithCapsules.owner_id,
        name: accessKeyWithCapsules.owner_name || 'Unknown User',
        email: 'access@key.user',
        isDeceased: false, // Access keys don't depend on owner status by default
        createdAt: accessKeyWithCapsules.created_at
      };

      // Create a virtual access token for compatibility
      const virtualAccessToken = {
        id: accessKeyWithCapsules.id,
        token: token,
        name: accessKeyWithCapsules.name,
        description: accessKeyWithCapsules.notes || '',
        capsuleGroupId: virtualGroup.id,
        ownerId: virtualOwner.id,
        ownerName: virtualOwner.name,
        createdAt: accessKeyWithCapsules.created_at,
        expiresAt: accessKeyWithCapsules.expires_at,
        isActive: accessKeyWithCapsules.is_active,
        maxUses: accessKeyWithCapsules.max_access_count,
        currentUses: accessKeyWithCapsules.access_count,
        allowedUsers: ['access_key_user'],
        priority: 'high',
        requiresOwnerDeceased: false // Access keys don't require death by default
      };

      return {
        data: {
          accessToken: virtualAccessToken,
          group: virtualGroup,
          capsules: accessKeyWithCapsules.capsules,
          owner: virtualOwner
        },
        success: true
      };
    } catch (error) {
      console.error('Error validating access token:', error);
      return {
        data: null,
        success: false,
        error: 'Error validating access token'
      };
    }
  }

  async updateAccessToken(id: string, updates: any) {
    try {
      // Map legacy updates to access key updates
      const accessKeyUpdates: Partial<AccessKey> = {};
      
      if (updates.currentUses !== undefined) {
        accessKeyUpdates.access_count = updates.currentUses;
      }
      
      if (updates.lastAccessed !== undefined) {
        accessKeyUpdates.last_accessed_at = updates.lastAccessed;
      }

      await this.updateAccessKey(id, accessKeyUpdates);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating access token:', error);
      return { success: false, error: 'Error updating access token' };
    }
  }

  // Legacy method names for compatibility
  async getAccessKeysByOwnerId(ownerId: string) {
    try {
      const accessKeys = await this.getAccessKeys(ownerId);
      return { success: true, data: accessKeys };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async createAccessKeyLegacy(accessKeyData: any) {
    try {
      const { allowedCapsuleIds, ...keyData } = accessKeyData;
      const newAccessKey = await this.createAccessKey(keyData, allowedCapsuleIds || []);
      return { success: true, data: newAccessKey };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async deleteAccessKeyLegacy(id: string) {
    try {
      await this.deleteAccessKey(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const supabaseService = new SupabaseService();