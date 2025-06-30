import React from 'react';
import { Package, Clock, Shield, Edit, Trash2, Eye, Flame } from 'lucide-react';
import { Capsule } from '../../services/supabaseService';

interface CapsuleCardProps {
  capsule: Capsule;
  onEdit: (capsule: Capsule) => void;
  onDelete: (id: string) => void;
}

const categoryIcons = {
  passwords: Shield,
  instructions: Package,
  messages: Clock,
  assets: Package
};

const categoryColors = {
  passwords: 'from-red-500 to-pink-500',
  instructions: 'from-blue-500 to-cyan-500',
  messages: 'from-purple-500 to-indigo-500',
  assets: 'from-green-500 to-teal-500'
};

const categoryLabels = {
  passwords: 'Passwords',
  instructions: 'Instructions',
  messages: 'Messages',
  assets: 'Assets'
};

const CapsuleCard: React.FC<CapsuleCardProps> = ({ capsule, onEdit, onDelete }) => {
  const Icon = categoryIcons[capsule.category];
  const colorClass = categoryColors[capsule.category];
  const label = categoryLabels[capsule.category];

  const hasSelfDestruct = capsule.self_destruct_enabled;
  const readsRemaining = hasSelfDestruct 
    ? (capsule.self_destruct_max_reads - capsule.self_destruct_current_reads)
    : null;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:bg-white/15 transition-all group">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <div className={`w-12 h-12 bg-gradient-to-br ${colorClass} rounded-lg flex items-center justify-center relative flex-shrink-0`}>
            <Icon className="w-6 h-6 text-white" />
            {hasSelfDestruct && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                <Flame className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-1 text-white line-clamp-1">
              {capsule.title}
            </h3>
            <div className="flex items-center space-x-2 mb-2">
              <p className="text-white/60 text-sm">{label}</p>
              {hasSelfDestruct && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs">
                  <Flame className="w-3 h-3" />
                  <span>{readsRemaining} read{readsRemaining !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
          <button
            onClick={() => onEdit(capsule)}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            title="Edit capsule"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(capsule.id)}
            className="p-2 text-white/60 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
            title="Delete capsule"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="mb-4">
        <p className="text-white/80 text-sm line-clamp-3 leading-relaxed">
          {capsule.content.length > 120 
            ? `${capsule.content.substring(0, 120)}...` 
            : capsule.content
          }
        </p>
      </div>

      {/* Self-Destruct Warning */}
      {hasSelfDestruct && (
        <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2 mb-1">
            <Flame className="w-3 h-3 text-orange-300" />
            <span className="text-orange-200 text-xs font-medium">
              Self-destruction: {readsRemaining} of {capsule.self_destruct_max_reads} reads remaining
            </span>
          </div>
          {capsule.self_destruct_warning_message && (
            <p className="text-orange-200/70 text-xs">
              "{capsule.self_destruct_warning_message.substring(0, 60)}..."
            </p>
          )}
        </div>
      )}

      {/* Footer Section */}
      <div className="space-y-3">
        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs text-white/60">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{capsule.unlock_rule_days ?? 'N/A'} days</span>
            </span>
          </div>
          
          {/* Status Badge */}
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            capsule.is_active 
              ? 'bg-green-500/20 text-green-300' 
              : 'bg-gray-500/20 text-gray-300'
          }`}>
            {capsule.is_active ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapsuleCard;