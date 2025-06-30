import React, { useState, useEffect } from 'react';
import { Heart, Clock, AlertTriangle, Settings, RotateCcw, Zap, CheckCircle, XCircle } from 'lucide-react';
import { lifeVerificationService } from '../../services/lifeVerificationService';

interface LifeVerificationStatus {
  lastActiveAt: string;
  isAlive: boolean;
  timeRemaining: number;
  timeRemainingFormatted: string;
  maxInactivityMs: number;
  config: any;
}

const LifeVerificationWidget: React.FC = () => {
  const [status, setStatus] = useState<LifeVerificationStatus | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [configValue, setConfigValue] = useState(45);
  const [configUnit, setConfigUnit] = useState<'seconds' | 'minutes' | 'hours' | 'days'>('seconds');

  useEffect(() => {
    // Initialize the service
    lifeVerificationService.initialize();

    // Subscribe to updates
    const unsubscribe = lifeVerificationService.subscribe((newStatus) => {
      setStatus(newStatus);
    });

    // Set initial configuration values
    const currentConfig = lifeVerificationService.getConfig();
    setConfigValue(currentConfig.maxInactivityPeriod.value);
    setConfigUnit(currentConfig.maxInactivityPeriod.unit);

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, []);

  const handleConfirmAlive = () => {
    lifeVerificationService.confirmAlive();
  };

  const handleUpdateConfig = () => {
    const newConfig = {
      maxInactivityPeriod: {
        value: configValue,
        unit: configUnit
      }
    };
    
    lifeVerificationService.updateConfig(newConfig);
    setShowConfig(false);
  };

  const handleSimulateTime = (seconds: number) => {
    lifeVerificationService.simulateTimePass(seconds);
  };

  const handleSimulate90Days = () => {
    // 90 days = 90 * 24 * 60 * 60 = 7,776,000 seconds
    const ninetyDaysInSeconds = 90 * 24 * 60 * 60;
    lifeVerificationService.simulateTimePass(ninetyDaysInSeconds);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the life verification system?')) {
      lifeVerificationService.reset();
    }
  };

  if (!status) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-white/70">Loading life verification...</span>
        </div>
      </div>
    );
  }

  const isAlive = status.isAlive;
  const isCritical = status.timeRemaining <= 10000; // Last 10 seconds

  return (
    <div className="space-y-4">
      {/* Main Widget */}
      <div className={`bg-white/10 backdrop-blur-md rounded-xl p-6 border transition-all ${
        isAlive 
          ? isCritical 
            ? 'border-orange-500/50 bg-orange-500/10' 
            : 'border-white/10'
          : 'border-red-500/50 bg-red-500/10'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isAlive 
                ? isCritical
                  ? 'bg-gradient-to-br from-orange-500 to-red-500'
                  : 'bg-gradient-to-br from-green-500 to-emerald-500'
                : 'bg-gradient-to-br from-red-500 to-red-600'
            }`}>
              {isAlive ? (
                <Heart className={`w-6 h-6 text-white ${isCritical ? 'animate-pulse' : ''}`} />
              ) : (
                <XCircle className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Life Verification</h3>
              <p className="text-white/70 text-sm">Inactivity detection system</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Main Information */}
        <div className="space-y-4">
          {/* Last Confirmation */}
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm">Last confirmation:</span>
            <span className="text-white font-mono text-sm">
              {new Date(status.lastActiveAt).toLocaleString()}
            </span>
          </div>

          {/* Time Remaining */}
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm">Time remaining:</span>
            <div className="flex items-center space-x-2">
              <Clock className={`w-4 h-4 ${isCritical ? 'text-orange-300 animate-pulse' : 'text-white/60'}`} />
              <span className={`font-mono text-xl font-bold ${
                isAlive 
                  ? isCritical 
                    ? 'text-orange-300' 
                    : 'text-green-300'
                  : 'text-red-300'
              }`}>
                {status.timeRemainingFormatted}
              </span>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm">Status:</span>
            <div className="flex items-center space-x-2">
              {isAlive ? (
                <>
                  <CheckCircle className={`w-4 h-4 ${isCritical ? 'text-orange-300' : 'text-green-300'}`} />
                  <span className={`font-medium ${isCritical ? 'text-orange-300' : 'text-green-300'}`}>
                    {isCritical ? '⚠️ Critical' : '✅ Active'}
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-300" />
                  <span className="text-red-300 font-medium">❌ Inactive - Legacy will be activated</span>
                </>
              )}
            </div>
          </div>

          {/* Confirmation Button */}
          <div className="pt-4 border-t border-white/20">
            <button
              onClick={handleConfirmAlive}
              className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold transition-all ${
                isAlive
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white animate-pulse'
              }`}
            >
              <RotateCcw className="w-5 h-5" />
              <span>🔁 Confirm I'm alive</span>
            </button>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-4">⚙️ Inactivity Configuration</h4>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Value
                </label>
                <input
                  type="number"
                  value={configValue}
                  onChange={(e) => setConfigValue(parseInt(e.target.value) || 1)}
                  min="1"
                  max="365"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Unit
                </label>
                <select
                  value={configUnit}
                  onChange={(e) => setConfigUnit(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="seconds">Seconds</option>
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleUpdateConfig}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all"
              >
                Apply Configuration
              </button>
              <button
                onClick={() => setShowConfig(false)}
                className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulation Panel (Demo Only) */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-xl p-6 border border-blue-300/20">
        <h4 className="text-lg font-semibold text-white mb-4">🎭 Simulation Mode (Demo)</h4>
        
        <div className="space-y-3">
          <p className="text-white/80 text-sm">
            Simulate time passage to demonstrate status changes:
          </p>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSimulateTime(10)}
              className="flex items-center space-x-1 bg-blue-500/20 text-blue-300 px-3 py-2 rounded-lg hover:bg-blue-500/30 transition-all text-sm"
            >
              <Zap className="w-4 h-4" />
              <span>-10s</span>
            </button>
            <button
              onClick={() => handleSimulateTime(30)}
              className="flex items-center space-x-1 bg-orange-500/20 text-orange-300 px-3 py-2 rounded-lg hover:bg-orange-500/30 transition-all text-sm"
            >
              <Zap className="w-4 h-4" />
              <span>-30s</span>
            </button>
            <button
              onClick={() => handleSimulateTime(60)}
              className="flex items-center space-x-1 bg-red-500/20 text-red-300 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-all text-sm"
            >
              <Zap className="w-4 h-4" />
              <span>-1m</span>
            </button>
            <button
              onClick={handleSimulate90Days}
              className="flex items-center space-x-1 bg-purple-500/20 text-purple-300 px-3 py-2 rounded-lg hover:bg-purple-500/30 transition-all text-sm font-medium"
            >
              <Zap className="w-4 h-4" />
              <span>-90 days</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center space-x-1 bg-green-500/20 text-green-300 px-3 py-2 rounded-lg hover:bg-green-500/30 transition-all text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
          
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-300 mt-0.5" />
              <div>
                <p className="text-yellow-200 text-xs font-medium">💡 Hackathon Demo Tips</p>
                <div className="text-yellow-200/90 text-xs mt-1 space-y-1">
                  <p><strong>Quick Demo:</strong> Set 45 seconds, wait 35s, then simulate -15s to show critical status.</p>
                  <p><strong>Full Demo:</strong> Use the new "-90 days" button to instantly simulate the full inactivity period and trigger legacy activation.</p>
                  <p><strong>Reset:</strong> Use "Reset" to return to initial state for multiple demonstrations.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifeVerificationWidget;