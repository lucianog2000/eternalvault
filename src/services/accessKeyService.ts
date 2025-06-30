import { AccessKey, AccessKeyCreationRequest, GeneratedAccessKey } from '../types';

class AccessKeyService {
  private readonly KEY_PREFIX = 'evault_';
  private readonly KEY_LENGTH = 40; // Longitud total de la llave

  /**
   * Genera una nueva Access Key segura
   */
  generateAccessKey(): GeneratedAccessKey {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const keyLength = this.KEY_LENGTH - this.KEY_PREFIX.length;
    
    let key = this.KEY_PREFIX;
    for (let i = 0; i < keyLength; i++) {
      key += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    // Formatear la llave para mejor legibilidad (grupos de 8 caracteres)
    const displayKey = this.formatKeyForDisplay(key);

    return {
      key,
      displayKey,
      isVisible: true
    };
  }

  /**
   * Formatea la llave para mostrar en grupos legibles
   */
  private formatKeyForDisplay(key: string): string {
    // Remover el prefijo para el formateo
    const keyWithoutPrefix = key.replace(this.KEY_PREFIX, '');
    
    // Dividir en grupos de 8 caracteres
    const groups = [];
    for (let i = 0; i < keyWithoutPrefix.length; i += 8) {
      groups.push(keyWithoutPrefix.substr(i, 8));
    }
    
    return `${this.KEY_PREFIX}${groups.join('-')}`;
  }

  /**
   * Normaliza una llave ingresada por el usuario (remueve guiones y espacios)
   */
  normalizeKey(inputKey: string): string {
    return inputKey.replace(/[-\s]/g, '').toLowerCase();
  }

  /**
   * Valida el formato de una Access Key
   */
  validateKeyFormat(key: string): boolean {
    const normalizedKey = this.normalizeKey(key);
    const expectedLength = this.KEY_LENGTH;
    
    return (
      normalizedKey.startsWith(this.KEY_PREFIX) &&
      normalizedKey.length === expectedLength &&
      /^[a-z0-9_]+$/.test(normalizedKey)
    );
  }

  /**
   * Crea una nueva Access Key
   */
  async createAccessKey(
    request: AccessKeyCreationRequest,
    ownerId: string
  ): Promise<{ accessKey: AccessKey; generatedKey: GeneratedAccessKey }> {
    const generatedKey = this.generateAccessKey();
    
    const accessKey: AccessKey = {
      id: `ak_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      key: generatedKey.key,
      name: request.name,
      allowedCapsuleIds: request.allowedCapsuleIds,
      createdAt: new Date().toISOString(),
      expiresAt: request.expiresAt,
      isActive: true,
      accessCount: 0,
      maxAccessCount: request.maxAccessCount,
      notes: request.notes
    };

    return { accessKey, generatedKey };
  }

  /**
   * Revoca una Access Key
   */
  revokeAccessKey(accessKeyId: string): boolean {
    // En una implementación real, esto actualizaría la base de datos
    return true;
  }

  /**
   * Regenera una Access Key (crea una nueva y revoca la anterior)
   */
  async regenerateAccessKey(accessKeyId: string): Promise<GeneratedAccessKey> {
    // En una implementación real, esto revocaría la llave anterior y crearía una nueva
    return this.generateAccessKey();
  }

  /**
   * Obtiene estadísticas de uso de Access Keys
   */
  getAccessKeyStats(accessKeys: AccessKey[]): any {
    const now = new Date();
    const activeKeys = accessKeys.filter(key => 
      key.isActive && (!key.expiresAt || new Date(key.expiresAt) > now)
    );
    const expiredKeys = accessKeys.filter(key => 
      key.expiresAt && new Date(key.expiresAt) <= now
    );
    const totalAccesses = accessKeys.reduce((sum, key) => sum + key.accessCount, 0);

    return {
      totalKeys: accessKeys.length,
      activeKeys: activeKeys.length,
      expiredKeys: expiredKeys.length,
      totalAccesses,
      recentAccesses: [] // En una implementación real, esto vendría de logs de acceso
    };
  }

  /**
   * Verifica si una Access Key es válida y está activa
   */
  validateAccessKey(key: string, accessKeys: AccessKey[]): AccessKey | null {
    const normalizedKey = this.normalizeKey(key);
    
    const accessKey = accessKeys.find(ak => 
      this.normalizeKey(ak.key) === normalizedKey && ak.isActive
    );

    if (!accessKey) return null;

    // Verificar expiración
    if (accessKey.expiresAt && new Date(accessKey.expiresAt) <= new Date()) {
      return null;
    }

    // Verificar límite de accesos
    if (accessKey.maxAccessCount && 
        accessKey.accessCount >= accessKey.maxAccessCount) {
      return null;
    }

    return accessKey;
  }

  /**
   * Registra un acceso a una Access Key
   */
  recordAccess(accessKey: AccessKey, accessedFrom?: string): AccessKey {
    return {
      ...accessKey,
      accessCount: accessKey.accessCount + 1,
      lastAccessed: new Date().toISOString(),
      lastAccessedFrom: accessedFrom
    };
  }

  /**
   * Obtiene información de seguridad de una llave
   */
  getKeySecurityInfo(accessKey: AccessKey): any {
    const now = new Date();
    const createdDate = new Date(accessKey.createdAt);
    const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let securityLevel = 'high';
    const warnings = [];

    // Verificar edad de la llave
    if (daysSinceCreation > 365) {
      securityLevel = 'medium';
      warnings.push('Esta llave tiene más de un año de antigüedad');
    }

    // Verificar uso excesivo
    if (accessKey.accessCount > 100) {
      warnings.push('Esta llave ha sido utilizada muchas veces');
    }

    // Verificar si está próxima a expirar
    if (accessKey.expiresAt) {
      const expirationDate = new Date(accessKey.expiresAt);
      const daysUntilExpiration = Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiration <= 30 && daysUntilExpiration > 0) {
        warnings.push(`Expira en ${daysUntilExpiration} días`);
      } else if (daysUntilExpiration <= 0) {
        securityLevel = 'low';
        warnings.push('Esta llave ha expirado');
      }
    }

    return {
      securityLevel,
      warnings,
      daysSinceCreation,
      lastAccessDays: accessKey.lastAccessed 
        ? Math.floor((now.getTime() - new Date(accessKey.lastAccessed).getTime()) / (1000 * 60 * 60 * 24))
        : null
    };
  }
}

export const accessKeyService = new AccessKeyService();