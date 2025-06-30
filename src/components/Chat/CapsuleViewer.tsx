import React, { useState } from 'react';
import { X, Eye, Calendar, User, Package, AlertTriangle, Flame, Shield, Clock } from 'lucide-react';
import { Capsule } from '../../services/supabaseService';

interface CapsuleViewerProps {
  capsule: Capsule;
  ownerName: string;
  onClose: () => void;
  onCapsuleRead?: (capsuleId: string) => void; // Callback to register reading
}

const CapsuleViewer: React.FC<CapsuleViewerProps> = ({ capsule, ownerName, onClose, onCapsuleRead }) => {
  const [showContent, setShowContent] = useState(false);
  const [hasAcknowledgedWarning, setHasAcknowledgedWarning] = useState(false);
  const [isReading, setIsReading] = useState(false);

  const categoryIcons: Record<string, string> = {
    passwords: '🔐',
    instructions: '📋',
    messages: '💌',
    assets: '💎'
  };

  const categoryLabels: Record<string, string> = {
    passwords: 'Passwords and Credentials',
    instructions: 'Instructions',
    messages: 'Personal Message',
    assets: 'Digital Assets'
  };

  const categoryColors: Record<string, string> = {
    passwords: 'from-red-500 to-pink-500',
    instructions: 'from-blue-500 to-cyan-500',
    messages: 'from-purple-500 to-indigo-500',
    assets: 'from-green-500 to-teal-500'
  };

  const hasSelfDestruct = capsule.self_destruct_enabled;
  const readsRemaining = hasSelfDestruct 
    ? (capsule.self_destruct_max_reads - capsule.self_destruct_current_reads)
    : null;
  const willDestroyAfterRead = hasSelfDestruct && capsule.self_destruct_destroy_after_read && readsRemaining === 1;

  const handleRevealContent = async () => {
    if (hasSelfDestruct && !hasAcknowledgedWarning) {
      setHasAcknowledgedWarning(true);
      return;
    }
    
    setIsReading(true);
    
    try {
      // Register the reading - this may destroy the capsule
      if (onCapsuleRead) {
        await onCapsuleRead(capsule.id);
      }
      
      setShowContent(true);
    } catch (error) {
      console.error('Error registering reading:', error);
      // Show content even if there's an error in registration
      setShowContent(true);
    } finally {
      setIsReading(false);
    }
  };

  const handleClose = () => {
    if (showContent && willDestroyAfterRead) {
      if (confirm('This capsule will be permanently deleted upon closing. Are you sure you want to continue?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-white/20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${categoryColors[capsule.category]} rounded-lg flex items-center justify-center relative`}>
              <span className="text-2xl">{`${categoryIcons[capsule.category]}`}</span>
              {hasSelfDestruct && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                  <Flame className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{capsule.title}</h2>
              <div className="flex items-center space-x-3">
                <p className="text-white/80">{`${categoryLabels[capsule.category]}`}</p>
                {hasSelfDestruct && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs">
                    <Flame className="w-3 h-3" />
                    <span>{readsRemaining} read{readsRemaining !== 1 ? 's' : ''} remaining</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Metadata */}
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-white/80">
              <User className="w-4 h-4" />
              <span>Created by {ownerName}</span>
            </div>
            <div className="flex items-center space-x-2 text-white/80">
              <Calendar className="w-4 h-4" />
              <span>Date: {new Date(capsule.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2 text-white/80">
              <Package className="w-4 h-4" />
              <span>Category: {`${categoryLabels[capsule.category]}`}</span>
            </div>
          </div>

          {/* Self-Destruct Warning */}
          {hasSelfDestruct && !showContent && (
            <div className="bg-orange-500/20 border border-orange-500/40 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-orange-200 font-bold text-lg mb-2">🔥 Self-Destructing Capsule</h3>
                  <div className="space-y-3 text-orange-200/95">
                    <p><strong>Reads remaining:</strong> {readsRemaining} of {capsule.self_destruct_max_reads}</p>
                    <p><strong>Reads completed:</strong> {capsule.self_destruct_current_reads}</p>
                    {willDestroyAfterRead && (
                      <p className="text-orange-100 font-medium">
                        ⚠️ <strong>CRITICAL WARNING:</strong> This is the last available read. 
                        The capsule will be permanently deleted after viewing and cannot be recovered ever.
                      </p>
                    )}
                    {capsule.self_destruct_warning_message && (
                      <div className="bg-orange-600/30 rounded-lg p-3 border border-orange-500/50">
                        <p className="text-orange-100 text-sm">
                          <strong>Owner's message:</strong><br />
                          {capsule.self_destruct_warning_message}
                        </p>
                      </div>
                    )}
                    <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3">
                      <p className="text-red-200 text-sm">
                        <strong>Important:</strong> Once you view the content, the read counter will automatically increment. 
                        {willDestroyAfterRead && ' When you close this window, the capsule will be permanently deleted from the database.'}
                        {!willDestroyAfterRead && ` There will be ${readsRemaining - 1} read${readsRemaining - 1 !== 1 ? 's' : ''} left after this one.`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Reveal Button or Content */}
          {!showContent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                {hasSelfDestruct ? 'Reveal Protected Content' : 'View Capsule Content'}
              </h3>
              <p className="text-white/80 mb-6">
                {hasSelfDestruct 
                  ? 'Click to reveal the content. This action will be registered and count as a read.'
                  : 'Click to view the content they left for you.'
                }
              </p>
              
              {hasSelfDestruct && !hasAcknowledgedWarning ? (
                <button
                  onClick={handleRevealContent}
                  disabled={isReading}
                  className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all font-semibold disabled:opacity-50"
                >
                  {isReading ? 'Processing...' : 'I Understand the Risks - Continue'}
                </button>
              ) : (
                <button
                  onClick={handleRevealContent}
                  disabled={isReading}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all font-semibold disabled:opacity-50 flex items-center space-x-2 mx-auto"
                >
                  {isReading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Registering read...</span>
                    </>
                  ) : (
                    <span>{hasSelfDestruct ? 'Reveal Content Now' : 'View Content'}</span>
                  )}
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Content */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Capsule Content</span>
                  {willDestroyAfterRead && (
                    <div className="flex items-center space-x-1 px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs">
                      <Flame className="w-3 h-3" />
                      <span>Will delete on close</span>
                    </div>
                  )}
                </h3>
                <div className="bg-white/5 rounded-xl p-6 border border-white/20">
                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-white/95 font-sans leading-relaxed">
                      {capsule.content}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Post-Read Warning */}
              {willDestroyAfterRead && (
                <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-300 mt-0.5" />
                    <div>
                      <p className="text-red-200 font-medium">⚠️ Final Read Completed</p>
                      <p className="text-red-200/90 text-sm mt-1">
                        You have viewed this capsule's content for the last time. When you close this window, 
                        the capsule will be permanently deleted from the database and cannot be recovered. 
                        Make sure you have copied all necessary information.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reading Confirmation */}
              {hasSelfDestruct && !willDestroyAfterRead && (
                <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Eye className="w-5 h-5 text-blue-300 mt-0.5" />
                    <div>
                      <p className="text-blue-200 font-medium">✅ Read Registered</p>
                      <p className="text-blue-200/90 text-sm mt-1">
                        This read has been counted. There are {readsRemaining - 1} read{readsRemaining - 1 !== 1 ? 's' : ''} 
                        available before the capsule automatically deletes.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Unlock Rule Info */}
          <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-4">
            <h4 className="text-blue-200 font-medium mb-2">📋 Unlock Information</h4>
            <div className="text-blue-200/90 text-sm">
              <p>• <strong>Rule:</strong> Prolonged inactivity</p>
              <p>• <strong>Configured days:</strong> {capsule.unlock_rule_days} days</p>
              <p>• <strong>Status:</strong> {capsule.is_unlocked ? 'Unlocked' : 'Locked'}</p>
              {hasSelfDestruct && (
                <>
                  <p>• <strong>Self-destruction:</strong> Enabled</p>
                  <p>• <strong>Reads allowed:</strong> {capsule.self_destruct_max_reads}</p>
                  <p>• <strong>Reads completed:</strong> {capsule.self_destruct_current_reads + (showContent ? 1 : 0)}</p>
                  <p>• <strong>Reads remaining:</strong> {Math.max(0, readsRemaining! - (showContent ? 1 : 0))}</p>
                </>
              )}
              <p className="mt-2 text-blue-200/80">
                This capsule was automatically unlocked according to the rules established by {ownerName}.
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-purple-500/20 border border-purple-500/40 rounded-lg p-4">
            <h4 className="text-purple-200 font-medium mb-2">🔐 Security Information</h4>
            <div className="text-purple-200/90 text-sm space-y-1">
              <p>• This information was protected with military-grade encryption</p>
              <p>• Only you have access to this specific capsule</p>
              <p>• Access was granted according to {ownerName}'s instructions</p>
              <p>• Your access to this information is logged for audit purposes</p>
              {hasSelfDestruct && (
                <p>• This capsule has self-destruction configured for maximum security</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/20 flex justify-between items-center">
          <div className="flex items-center space-x-4 text-sm text-white/70">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Accessed: {new Date().toLocaleString()}</span>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className={`px-6 py-3 rounded-lg transition-all font-semibold ${
              willDestroyAfterRead && showContent
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
            }`}
          >
            {willDestroyAfterRead && showContent ? 'Close and Delete Capsule' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CapsuleViewer;