interface LifeVerificationConfig {
  maxInactivityPeriod: {
    value: number;
    unit: 'seconds' | 'minutes' | 'hours' | 'days';
  };
}

interface LifeVerificationStatus {
  lastActiveAt: string;
  isAlive: boolean;
  timeRemaining: number; // en milisegundos
  timeRemainingFormatted: string;
  maxInactivityMs: number;
  config: LifeVerificationConfig;
}

class LifeVerificationService {
  private readonly STORAGE_KEY = 'eternalvault_life_verification';
  private readonly CONFIG_KEY = 'eternalvault_life_config';
  private intervalId: NodeJS.Timeout | null = null;
  private callbacks: ((status: LifeVerificationStatus) => void)[] = [];

  /**
   * Configuración por defecto (45 segundos para demo)
   */
  private getDefaultConfig(): LifeVerificationConfig {
    return {
      maxInactivityPeriod: {
        value: 45,
        unit: 'seconds'
      }
    };
  }

  /**
   * Convierte la configuración a milisegundos
   */
  private configToMilliseconds(config: LifeVerificationConfig): number {
    const { value, unit } = config.maxInactivityPeriod;
    
    switch (unit) {
      case 'seconds': return value * 1000;
      case 'minutes': return value * 60 * 1000;
      case 'hours': return value * 60 * 60 * 1000;
      case 'days': return value * 24 * 60 * 60 * 1000;
      default: return value * 1000;
    }
  }

  /**
   * Formatea el tiempo restante en HH:MM:SS
   */
  private formatTimeRemaining(milliseconds: number): string {
    if (milliseconds <= 0) return '00:00:00';

    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Obtiene la configuración actual
   */
  getConfig(): LifeVerificationConfig {
    const saved = localStorage.getItem(this.CONFIG_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error parsing life verification config:', error);
      }
    }
    return this.getDefaultConfig();
  }

  /**
   * Actualiza la configuración
   */
  updateConfig(config: LifeVerificationConfig): void {
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
    
    // Reiniciar el temporizador con la nueva configuración
    this.stopTimer();
    this.startTimer();
    
    console.log('🔧 Configuración de verificación de vida actualizada:', config);
  }

  /**
   * Confirma que el usuario sigue vivo
   */
  confirmAlive(): void {
    const now = new Date().toISOString();
    localStorage.setItem(this.STORAGE_KEY, now);
    
    console.log('✅ Confirmación de vida registrada:', now);
    
    // Notificar a todos los callbacks
    this.notifyCallbacks();
  }

  /**
   * Obtiene el estado actual de verificación de vida
   */
  getStatus(): LifeVerificationStatus {
    const config = this.getConfig();
    const maxInactivityMs = this.configToMilliseconds(config);
    const lastActiveAt = localStorage.getItem(this.STORAGE_KEY) || new Date().toISOString();
    
    const lastActiveTime = new Date(lastActiveAt).getTime();
    const currentTime = new Date().getTime();
    const timeSinceLastActive = currentTime - lastActiveTime;
    const timeRemaining = Math.max(0, maxInactivityMs - timeSinceLastActive);
    
    const isAlive = timeRemaining > 0;
    const timeRemainingFormatted = this.formatTimeRemaining(timeRemaining);

    return {
      lastActiveAt,
      isAlive,
      timeRemaining,
      timeRemainingFormatted,
      maxInactivityMs,
      config
    };
  }

  /**
   * Inicia el temporizador en tiempo real
   */
  startTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      this.notifyCallbacks();
    }, 1000); // Actualizar cada segundo

    console.log('⏰ Temporizador de verificación de vida iniciado');
  }

  /**
   * Detiene el temporizador
   */
  stopTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ Temporizador de verificación de vida detenido');
    }
  }

  /**
   * Suscribe un callback para recibir actualizaciones del estado
   */
  subscribe(callback: (status: LifeVerificationStatus) => void): () => void {
    this.callbacks.push(callback);
    
    // Enviar estado inicial
    callback(this.getStatus());
    
    // Retornar función para desuscribirse
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notifica a todos los callbacks suscritos
   */
  private notifyCallbacks(): void {
    const status = this.getStatus();
    this.callbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in life verification callback:', error);
      }
    });
  }

  /**
   * Simula el paso del tiempo (para demos)
   */
  simulateTimePass(seconds: number): void {
    const lastActiveAt = localStorage.getItem(this.STORAGE_KEY);
    if (!lastActiveAt) return;

    const lastActiveTime = new Date(lastActiveAt).getTime();
    const simulatedTime = new Date(lastActiveTime - (seconds * 1000)).toISOString();
    
    localStorage.setItem(this.STORAGE_KEY, simulatedTime);
    this.notifyCallbacks();
    
    console.log(`⏭️ Simulación: ${seconds} segundos hacia atrás. Nueva última actividad: ${simulatedTime}`);
  }

  /**
   * Resetea el sistema (para testing)
   */
  reset(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.CONFIG_KEY);
    this.confirmAlive(); // Establecer tiempo actual
    
    console.log('🔄 Sistema de verificación de vida reseteado');
  }

  /**
   * Inicializa el servicio
   */
  initialize(): void {
    // Si no hay registro previo, confirmar que está vivo ahora
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      this.confirmAlive();
    }
    
    this.startTimer();
    console.log('🚀 Servicio de verificación de vida inicializado');
  }

  /**
   * Limpia recursos al destruir
   */
  destroy(): void {
    this.stopTimer();
    this.callbacks = [];
    console.log('🧹 Servicio de verificación de vida destruido');
  }
}

export const lifeVerificationService = new LifeVerificationService();