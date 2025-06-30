export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Capsule {
  id: string;
  title: string;
  content: string;
  category: 'passwords' | 'instructions' | 'messages' | 'assets';
  createdAt: string;
  updatedAt: string;
  unlockRule: UnlockRule;
  isActive: boolean;
  isUnlocked: boolean;
  ownerId: string;
  isDestroyed?: boolean;
  destroyedAt?: string;
  accessHistory?: CapsuleAccess[];
  selfDestruct?: SelfDestructConfig;
}

export interface SelfDestructConfig {
  enabled: boolean;
  maxReads: number;
  currentReads: number;
  destroyAfterRead: boolean;
  warningMessage?: string;
}

export interface CapsuleAccess {
  id: string;
  accessedAt: string;
  accessedBy?: string;
  accessMethod: 'direct' | 'chat' | 'api';
  ipAddress?: string;
  userAgent?: string;
}

export interface UnlockRule {
  id: string;
  type: 'inactivity';
  config: {
    days: number;
  };
  isActive: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  capsuleReferences?: string[];
  legacyContext?: string;
}

export interface AIResponse {
  message: string;
  capsuleReferences?: Capsule[];
  confidence: number;
  legacyOwnerName?: string;
}

// Tipos específicos para el sistema de legados con JSON
export interface LegacyUser {
  id: string;
  name: string;
  email: string;
  isDeceased: boolean;
  deceasedAt?: string;
  lastActivity?: string;
  profileImage?: string;
  bio?: string;
  createdAt: string;
}

export interface CapsuleGroup {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  category: string;
  priority: string;
}

export interface AccessToken {
  id: string;
  token: string;
  name: string;
  description: string;
  capsuleGroupId: string;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  maxUses?: number;
  currentUses: number;
  allowedUsers: string[];
  priority: string;
}

export interface LegacyAccess {
  id: string;
  ownerName: string;
  ownerId: string;
  accessToken: string;
  capsuleGroupId: string;
  grantedAt: string;
}

export interface LegacyOwner {
  id: string;
  name: string;
  email: string;
  isDeceased: boolean;
  deceasedAt?: string;
  lastActivity?: string;
  bio?: string;
}

export interface LegacyCapsule {
  id: string;
  title: string;
  content: string;
  category: 'passwords' | 'instructions' | 'messages' | 'assets';
  groupId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  unlock_rule_type: string;
  unlock_rule_days: number;
  unlock_rule_active: boolean;
  isActive: boolean;
  isUnlocked: boolean;
  isDestroyed?: boolean;
  destroyedAt?: string;
  accessHistory?: CapsuleAccess[];
  selfDestruct?: SelfDestructConfig;
  priority: string;
}

// Tipos para el sistema de llaves de acceso
export interface AccessKey {
  id: string;
  key: string; // Esta será la llave real, pero nunca se mostrará después de la creación
  name: string;
  allowedCapsuleIds: string[];
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  accessCount: number;
  maxAccessCount?: number;
  lastAccessed?: string;
  lastAccessedFrom?: string;
  notes?: string;
}

export interface AccessKeyCreationRequest {
  name: string;
  allowedCapsuleIds: string[];
  expiresAt?: string;
  maxAccessCount?: number;
  notes?: string;
}

export interface GeneratedAccessKey {
  key: string; // La llave completa
  displayKey: string; // La llave formateada para mostrar
  isVisible: boolean; // Control de visibilidad
}