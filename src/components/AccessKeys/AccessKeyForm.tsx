import React, { useState } from 'react';
import { X, Key, Calendar, Shield, Info, Package, Search } from 'lucide-react';
import { useCapsules } from '../../contexts/CapsuleContext';

interface AccessKeyCreationRequest {
  name: string;
  allowedCapsuleIds: string[];
  expiresAt?: string;
  maxAccessCount?: number;
  notes?: string;
}

interface AccessKeyFormProps {
  onSave: (request: AccessKeyCreationRequest) => void;
  onCancel: () => void;
}

const AccessKeyForm: React.FC<AccessKeyFormProps> = ({ onSave, onCancel }) => {
  const { capsules } = useCapsules();
  const [name, setName] = useState('');
  const [selectedCapsuleIds, setSelectedCapsuleIds] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState('');
  const [maxAccessCount, setMaxAccessCount] = useState('');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter capsules by search term
  const filteredCapsules = capsules.filter(capsule =>
    capsule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    capsule.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCapsuleToggle = (capsuleId: string) => {
    setSelectedCapsuleIds(prev =>
      prev.includes(capsuleId)
        ? prev.filter(id => id !== capsuleId)
        : [...prev, capsuleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCapsuleIds.length === filteredCapsules.length) {
      setSelectedCapsuleIds([]);
    } else {
      setSelectedCapsuleIds(filteredCapsules.map(c => c.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter a key name');
      return;
    }

    if (selectedCapsuleIds.length === 0) {
      alert('You must select at least one capsule');
      return;
    }

    const request: AccessKeyCreationRequest = {
      name: name.trim(),
      allowedCapsuleIds: selectedCapsuleIds,
      expiresAt: expiresAt || undefined,
      maxAccessCount: maxAccessCount ? parseInt(maxAccessCount) : undefined,
      notes: notes.trim() || undefined
    };

    onSave(request);
  };

  const categoryIcons = {
    passwords: '🔐',
    instructions: '📋',
    messages: '💌',
    assets: '💎'
  };

  const categoryLabels = {
    passwords: 'Passwords',
    instructions: 'Instructions',
    messages: 'Messages',
    assets: 'Assets'
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-white/20 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">New Access Key Group</h2>
          <button
            onClick={onCancel}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Key Name */}
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Access Key Name *
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: Family Access - Complete Information"
                required
              />
            </div>
            <p className="text-white/60 text-xs mt-1">
              This name will identify the group of capsules accessible with this key
            </p>
          </div>

          {/* Grouping Explanation */}
          <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Package className="w-5 h-5 text-blue-300 mt-0.5" />
              <div>
                <p className="text-blue-200 font-medium text-sm">📦 How Access Key Grouping Works</p>
                <p className="text-blue-200/90 text-xs mt-1">
                  This Access Key will create a "group" containing only the capsules you select below. 
                  Anyone with this key will only see these specific capsules - nothing else. 
                  This allows you to create different groups for different people (family, lawyer, friend, etc.).
                </p>
              </div>
            </div>
          </div>

          {/* Capsule Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Select Capsules for This Group ({selectedCapsuleIds.length} of {capsules.length})
              </h3>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-purple-300 hover:text-purple-200 text-sm font-medium"
              >
                {selectedCapsuleIds.length === filteredCapsules.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>

            {/* Search */}
            {capsules.length > 3 && (
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search capsules..."
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Capsules List */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {filteredCapsules.length > 0 ? (
                filteredCapsules.map((capsule) => (
                  <label
                    key={capsule.id}
                    className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg border border-white/20 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCapsuleIds.includes(capsule.id)}
                      onChange={() => handleCapsuleToggle(capsule.id)}
                      className="w-4 h-4 text-purple-500 bg-white/10 border-white/30 rounded focus:ring-purple-500 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">
                          {categoryIcons[capsule.category]}
                        </span>
                        <h4 className="text-white font-medium">{capsule.title}</h4>
                        <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded">
                          {categoryLabels[capsule.category]}
                        </span>
                        {capsule.self_destruct_enabled && (
                          <span className="text-xs text-orange-300 bg-orange-500/20 px-2 py-1 rounded">
                            🔥 Self-destruct
                          </span>
                        )}
                      </div>
                      <p className="text-white/80 text-sm line-clamp-2">
                        {capsule.content.length > 100 
                          ? `${capsule.content.substring(0, 100)}...` 
                          : capsule.content
                        }
                      </p>
                    </div>
                  </label>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-white/30 mx-auto mb-3" />
                  <p className="text-white/70">
                    {searchTerm ? 'No capsules found with that term' : 'No capsules available'}
                  </p>
                </div>
              )}
            </div>

            {selectedCapsuleIds.length > 0 && (
              <div className="mt-4 p-3 bg-purple-500/20 border border-purple-500/40 rounded-lg">
                <p className="text-purple-200 text-sm">
                  <strong>Selected capsules:</strong> {selectedCapsuleIds.length}
                </p>
                <p className="text-purple-200/90 text-xs mt-1">
                  This Access Key will create a group containing only these {selectedCapsuleIds.length} capsule{selectedCapsuleIds.length > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">Advanced Options</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Expiration Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <p className="text-white/60 text-xs mt-1">
                  Optional: the key will automatically expire on this date
                </p>
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Access Limit
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="number"
                    value={maxAccessCount}
                    onChange={(e) => setMaxAccessCount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Unlimited"
                    min="1"
                  />
                </div>
                <p className="text-white/60 text-xs mt-1">
                  Optional: maximum number of times the key can be used
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Additional Notes
            </label>
            <div className="relative">
              <Info className="absolute left-3 top-3 w-5 h-5 text-white/50" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Additional information about this access key group..."
              />
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Shield className="w-5 h-5 text-blue-300 mt-0.5" />
              <div>
                <p className="text-blue-200 font-medium">🔐 Security Information</p>
                <p className="text-blue-200/90 text-sm mt-1">
                  The access key will be generated automatically and will only be displayed once. 
                  This key will define a group containing only the {selectedCapsuleIds.length} capsule{selectedCapsuleIds.length !== 1 ? 's' : ''} you selected.
                  Make sure to copy and save it in a safe place before closing the window.
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
              Create Access Key Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccessKeyForm;