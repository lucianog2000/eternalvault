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
  id: string; // Now this is the actual access key (no hashing)
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
  owner_name?: string;
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
      .eq('is_destroyed', false)
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
        return null;
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

  // ==================== ACCESS KEYS (SIMPLIFIED) ====================
  
  async getAccessKeys(userId: string): Promise<AccessKeyWithCapsules[]> {
    // First, get the access keys without the join
    const { data: accessKeys, error: keysError } = await supabase
      .from('access_keys')
      .select('*')
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

    // Get the profile information separately
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.warn('Could not fetch profile information:', profileError);
    }

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
        owner_name: profile?.full_name || 'Unknown User'
      });
    }

    return accessKeysWithCapsules;
  }

  async createAccessKey(
    accessKeyData: Omit<AccessKey, 'id' | 'created_at' | 'updated_at'>,
    capsuleIds: string[]
  ): Promise<AccessKeyWithCapsules> {
    // Generate the access key that will be used as the primary key
    const generatedKey = this.generateAccessKey();
    
    console.log('🔑 Generated access key:', generatedKey);

    const newAccessKey = {
      id: generatedKey, // Use the generated key as the primary key
      ...accessKeyData
    };

    // Create the access key
    const { data: createdAccessKey, error: keyError } = await supabase
      .from('access_keys')
      .insert(newAccessKey)
      .select()
      .single();

    if (keyError) {
      console.error('Error creating access key:', keyError);
      throw new Error(keyError.message);
    }

    console.log('✅ Access key created with ID:', createdAccessKey.id);

    // Create relationships with capsules
    if (capsuleIds.length > 0) {
      const relations = capsuleIds.map(capsuleId => ({
        access_key_id: createdAccessKey.id,
        capsule_id: capsuleId
      }));

      const { error: relationsError } = await supabase
        .from('access_key_capsules')
        .insert(relations);

      if (relationsError) {
        console.error('Error creating capsule relations:', relationsError);
        await this.deleteAccessKey(createdAccessKey.id);
        throw new Error(relationsError.message);
      }

      console.log('✅ Capsule relations created:', relations.length);
    }

    const capsules = await this.getCapsulesByIds(capsuleIds);

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', createdAccessKey.owner_id)
      .single();

    return {
      ...createdAccessKey,
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
    const { error } = await supabase
      .from('access_keys')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting access key:', error);
      throw new Error(error.message);
    }
  }

  // ==================== DIRECT ACCESS KEY VALIDATION (NO NORMALIZATION) ====================
  
  /**
   * Validates an access key by direct ID lookup - EXACT MATCH, NO NORMALIZATION
   */
  async validateAccessKeyDirect(rawKey: string): Promise<{
    success: boolean;
    data?: {
      accessKey: AccessKeyWithCapsules;
      owner: {
        id: string;
        name: string;
        email: string;
      };
      group: {
        id: string;
        name: string;
        description: string;
      };
    };
    error?: string;
  }> {
    try {
      console.log('🔍 Direct access key lookup (EXACT MATCH):', rawKey);
      
      // Clean the key (only remove spaces and dashes, preserve case)
      const cleanedKey = rawKey.replace(/[-\s]/g, '').trim();
      console.log('🔧 Cleaned key (preserving case):', cleanedKey);
      
      // Direct lookup by ID (EXACT MATCH) - Use limit(1) instead of single()
      const { data: accessKeyData, error: keyError } = await supabase
        .from('access_keys')
        .select('*')
        .eq('id', cleanedKey)
        .limit(1);

      if (keyError) {
        console.error('❌ Error querying access key:', keyError);
        return {
          success: false,
          error: 'Access key not found'
        };
      }

      // Check if any results were returned
      if (!accessKeyData || accessKeyData.length === 0) {
        console.log('❌ Access key not found with exact match');
        return {
          success: false,
          error: 'Access key not found'
        };
      }

      const accessKey = accessKeyData[0];
      console.log('✅ Access key found:', accessKey.id, accessKey.name);

      // Get the profile information separately
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', accessKey.owner_id)
        .single();

      if (profileError) {
        console.warn('Could not fetch profile information:', profileError);
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
        console.error('❌ Error fetching capsule relations:', relationsError);
        return {
          success: false,
          error: 'Error loading capsules'
        };
      }

      const capsules = capsuleRelations?.map(rel => rel.capsules).filter(Boolean) || [];
      console.log('📦 Found capsules:', capsules.length);

      // Increment access count (best effort)
      try {
        await this.incrementAccessKeyUsage(accessKey.id);
      } catch (error) {
        console.warn('Warning: Could not increment access count:', error);
      }

      // Build response data
      const accessKeyWithCapsules: AccessKeyWithCapsules = {
        ...accessKey,
        capsules: capsules as Capsule[],
        owner_name: profile?.full_name || 'Unknown User'
      };

      const owner = {
        id: accessKey.owner_id,
        name: profile?.full_name || 'Unknown User',
        email: profile?.email || 'unknown@example.com'
      };

      const group = {
        id: `group_${accessKey.id}`,
        name: accessKey.name,
        description: accessKey.notes || `Direct access to ${capsules.length} capsule${capsules.length !== 1 ? 's' : ''}`
      };

      console.log('🎉 Direct access key validation successful');

      return {
        success: true,
        data: {
          accessKey: accessKeyWithCapsules,
          owner,
          group
        }
      };

    } catch (error) {
      console.error('💥 Exception validating access key:', error);
      return {
        success: false,
        error: 'Unexpected error validating access key'
      };
    }
  }

  /**
   * Increments the usage count for an access key
   */
  private async incrementAccessKeyUsage(accessKeyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('access_keys')
        .update({
          access_count: supabase.sql`access_count + 1`,
          last_accessed_at: new Date().toISOString()
        })
        .eq('id', accessKeyId);

      if (error) {
        console.error('Error incrementing access key usage:', error);
      } else {
        console.log('✅ Access key usage incremented');
      }
    } catch (error) {
      console.error('Exception incrementing access key usage:', error);
    }
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
    
    const capsule = await this.getCapsuleById(capsuleId);
    if (!capsule) {
      throw new Error('Capsule not found');
    }

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

    // Handle self-destruction
    if (capsule.self_destruct_enabled) {
      const newReadCount = capsule.self_destruct_current_reads + 1;
      
      console.log('🔥 Processing self-destruction:', {
        currentReads: capsule.self_destruct_current_reads,
        newReadCount,
        maxReads: capsule.self_destruct_max_reads,
        destroyAfterRead: capsule.self_destruct_destroy_after_read
      });
      
      if (newReadCount >= capsule.self_destruct_max_reads && capsule.self_destruct_destroy_after_read) {
        capsuleDestroyed = true;
        
        console.log('💥 CAPSULE WILL BE DESTROYED:', {
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

        await this.destroyCapsule(capsuleId);
        
        console.log('✅ Capsule marked as destroyed in database');

        return {
          accessRecord: newAccessRecord,
          capsuleDestroyed: true
        };
      } else {
        const updates: Partial<Capsule> = {
          self_destruct_current_reads: newReadCount
        };

        await this.updateCapsule(capsuleId, updates);
        
        console.log('✅ Capsule read count updated:', {
          id: capsule.id,
          self_destruct_current_reads: newReadCount
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
      .eq('is_destroyed', false);

    if (error) {
      console.error('Error fetching capsules by IDs:', error);
      throw new Error(error.message);
    }

    return data || [];
  }

  // Generate secure access key (will be used as primary key)
  generateAccessKey(): string {
    const prefix = 'evault_';
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const keyLength = 35;
    
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
  
  async validateAccessToken(token: string) {
    try {
      console.log('🔄 Legacy validateAccessToken called with token:', token.substring(0, 10) + '...');
      
      const result = await this.validateAccessKeyDirect(token);
      
      if (!result.success || !result.data) {
        return {
          data: null,
          success: false,
          error: result.error || 'Access key not found'
        };
      }

      const { accessKey, owner, group } = result.data;

      const virtualAccessToken = {
        id: accessKey.id,
        token: token,
        name: accessKey.name,
        description: accessKey.notes || '',
        capsuleGroupId: group.id,
        ownerId: owner.id,
        ownerName: owner.name,
        createdAt: accessKey.created_at,
        expiresAt: accessKey.expires_at,
        isActive: accessKey.is_active,
        maxUses: accessKey.max_access_count,
        currentUses: accessKey.access_count,
        allowedUsers: ['anonymous'],
        priority: 'high',
        requiresOwnerDeceased: false
      };

      return {
        data: {
          accessToken: virtualAccessToken,
          group: group,
          capsules: accessKey.capsules,
          owner: owner
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