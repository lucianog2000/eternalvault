import React, { useState, useEffect } from 'react';
import { X, Clock, AlertTriangle, Shield, Package } from 'lucide-react';
import { Capsule } from '../../services/supabaseService';
import { useCapsules } from '../../contexts/CapsuleContext';

interface CapsuleFormProps {
  capsule?: Capsule;
  onSave: (capsule: any) => void;
  onCancel: () => void;
}

const CapsuleForm: React.FC<CapsuleFormProps> = ({ capsule, onSave, onCancel }) => {
  const [title, setTitle] = useState(capsule?.title || '');
  const [content, setContent] = useState(capsule?.content || '');
  const [category, setCategory] = useState<'passwords' | 'instructions' | 'messages' | 'assets'>(
    capsule?.category || 'messages'
  );
  const [unlockRuleDays, setUnlockRuleDays] = useState(capsule?.unlock_rule_days || 90);
  
  // Self-destruct configuration
  const [selfDestructEnabled, setSelfDestructEnabled] = useState(capsule?.self_destruct_enabled || false);
  const [maxReads, setMaxReads] = useState(capsule?.self_destruct_max_reads || 1);
  const [destroyAfterRead, setDestroyAfterRead] = useState(capsule?.self_destruct_destroy_after_read || true);
  const [warningMessage, setWarningMessage] = useState(capsule?.self_destruct_warning_message || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      alert('Please complete the title and content');
      return;
    }

    if (unlockRuleDays < 1) {
      alert('Unlock rule days must be at least 1');
      return;
    }

    if (selfDestructEnabled && maxReads < 1) {
      alert('Maximum reads must be at least 1');
      return;
    }

    const capsuleData = {
      title: title.trim(),
      content: content.trim(),
      category,
      unlock_rule_type: 'inactivity',
      unlock_rule_days: unlockRuleDays,
      unlock_rule_active: true,
      self_destruct_enabled: selfDestructEnabled,
      self_destruct_max_reads: selfDestructEnabled ? maxReads : 1,
      self_destruct_current_reads: capsule?.self_destruct_current_reads || 0,
      self_destruct_destroy_after_read: destroyAfterRead,
      self_destruct_warning_message: selfDestructEnabled && warningMessage.trim() ? warningMessage.trim() : null,
      is_active: true,
      is_unlocked: false,
      is_destroyed: false,
      priority: 'medium'
    };

    onSave(capsuleData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-white/20 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {capsule ? 'Edit Capsule' : 'New Legacy Capsule'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Capsule Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g. Banking passwords"
                required
              />
            </div>
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="passwords">🔐 Passwords</option>
                <option value="instructions">📋 Instructions</option>
                <option value="messages">💌 Messages</option>
                <option value="assets">💎 Digital Assets</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Write here the information you want to preserve..."
              required
            />
          </div>

          {/* Self-Destruct Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">🔥 Self-Destruction</h3>
            <div className="bg-white/5 rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-orange-300" />
                  <span className="text-white font-medium">Enable Self-Destruction</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={selfDestructEnabled}
                    onChange={(e) => setSelfDestructEnabled(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>

              {selfDestructEnabled && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        Maximum Reads
                      </label>
                      <input
                        type="number"
                        value={maxReads}
                        onChange={(e) => setMaxReads(parseInt(e.target.value) || 1)}
                        min="1"
                        max="10"
                        className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <p className="text-white/60 text-xs mt-1">
                        Number of times it can be read before destruction
                      </p>
                    </div>
                    
                    <div className="flex items-center">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <input
                            type="checkbox"
                            id="destroyAfterRead"
                            checked={destroyAfterRead}
                            onChange={(e) => setDestroyAfterRead(e.target.checked)}
                            className="w-4 h-4 text-orange-500 bg-white/10 border-white/30 rounded focus:ring-orange-500"
                          />
                          <label htmlFor="destroyAfterRead" className="text-white/90 text-sm font-medium">
                            Destroy immediately
                          </label>
                        </div>
                        <p className="text-white/60 text-xs">
                          Destroys when read limit is reached
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">
                      Warning Message (Optional)
                    </label>
                    <textarea
                      value={warningMessage}
                      onChange={(e) => setWarningMessage(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      placeholder="e.g. WARNING: This information will be destroyed after reading. Make sure to copy everything necessary."
                    />
                    <p className="text-white/60 text-xs mt-1">
                      Message shown before revealing content
                    </p>
                  </div>

                  <div className="bg-orange-500/20 border border-orange-500/40 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-orange-300 mt-0.5" />
                      <div>
                        <p className="text-orange-200 font-medium text-sm">⚠️ Important Warning</p>
                        <p className="text-orange-200/90 text-xs mt-1">
                          Once the read limit is reached, this capsule will be permanently destroyed. 
                          This action cannot be undone. Use only for extremely sensitive information.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Unlock Rule */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Unlock Rule</h3>
            <div className="bg-white/5 rounded-lg p-4 border border-white/20">
              <div className="flex items-center space-x-3 mb-3">
                <Clock className="w-5 h-5 text-blue-300" />
                <span className="text-white font-medium">Prolonged Inactivity</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Inactivity Days
                  </label>
                  <input
                    type="number"
                    value={unlockRuleDays}
                    onChange={(e) => setUnlockRuleDays(parseInt(e.target.value) || 90)}
                    min="1"
                    max="3650"
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <div className="text-white/80 text-sm">
                    <p>The capsule will unlock automatically if there's no activity in your account for {unlockRuleDays} consecutive days.</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-white/60 text-xs mt-2">
              💡 More unlock methods will be available soon
            </p>
          </div>

          {/* Grouping Information */}
          <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Package className="w-5 h-5 text-blue-300 mt-0.5" />
              <div>
                <p className="text-blue-200 font-medium text-sm">📦 Capsule Grouping</p>
                <p className="text-blue-200/90 text-xs mt-1">
                  Capsules are automatically grouped by Access Keys. When you create an Access Key, 
                  you'll select which specific capsules to include in that group. This provides 
                  granular control over who can access what information.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-white/20">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all"
            >
              {capsule ? 'Update Capsule' : 'Create Capsule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CapsuleForm;