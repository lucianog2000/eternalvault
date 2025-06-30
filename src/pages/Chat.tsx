import React from 'react';
import { Heart, Sparkles, Shield, MessageCircle, Key, Users, Lock } from 'lucide-react';
import ChatInterface from '../components/Chat/ChatInterface';
import LegacySelector from '../components/Chat/LegacySelector';
import { useLegacy } from '../contexts/LegacyContext';
import { useAuth } from '../contexts/AuthContext';

const Chat: React.FC = () => {
  const { activeLegacy, legacyOwner, legacyCapsules } = useLegacy();
  const { user } = useAuth();

  return (
    <div className="h-full space-y-4">
      {/* Header - More compact */}
      <div className="text-center">
        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
        </div>
        <h1 className="text-xl lg:text-2xl font-bold text-white mb-2">
          {activeLegacy && legacyOwner
            ? `Conversing with ${legacyOwner.name}'s legacy`
            : 'Guardian Angel AI'
          }
        </h1>
        <p className="text-white/70 max-w-2xl mx-auto text-sm px-4">
          {activeLegacy && legacyOwner
            ? `Secure access to ${legacyCapsules.length} specific capsule${legacyCapsules.length !== 1 ? 's' : ''} from ${legacyOwner.name}'s legacy.`
            : 'Access key system for secure conversations with digital legacies'
          }
        </p>
        
        {/* Public Access Notice - More compact */}
        {!user && (
          <div className="mt-3 p-2 bg-blue-500/20 border border-blue-500/30 rounded max-w-2xl mx-auto">
            <p className="text-blue-200 text-xs">
              💡 <strong>Public Access:</strong> Use chat with access keys without registering. 
              To create your own legacy, you need an account.
            </p>
          </div>
        )}
      </div>

      {/* Legacy Selector - Compact */}
      <LegacySelector />

      {/* Chat Interface - Main feature */}
      <div className="h-[500px] lg:h-[700px]">
        <ChatInterface />
      </div>

      {/* Features - More compact and only when no active legacy */}
      {(!activeLegacy || !legacyOwner) && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="bg-white/10 backdrop-blur-md rounded p-2 border border-white/10 text-center">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center mx-auto mb-1">
              <Key className="w-3 h-3 text-white" />
            </div>
            <h3 className="text-xs font-semibold text-white mb-1">Unique Access Keys</h3>
            <p className="text-white/70 text-xs">
              Specific access per capsule
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded p-2 border border-white/10 text-center">
            <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-red-500 rounded flex items-center justify-center mx-auto mb-1">
              <Lock className="w-3 h-3 text-white" />
            </div>
            <h3 className="text-xs font-semibold text-white mb-1">Granular Security</h3>
            <p className="text-white/70 text-xs">
              Segmented information
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded p-2 border border-white/10 text-center">
            <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-orange-500 rounded flex items-center justify-center mx-auto mb-1">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <h3 className="text-xs font-semibold text-white mb-1">Personalized Experience</h3>
            <p className="text-white/70 text-xs">
              Contextualized and unique
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded p-2 border border-white/10 text-center">
            <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-yellow-500 rounded flex items-center justify-center mx-auto mb-1">
              <MessageCircle className="w-3 h-3 text-white" />
            </div>
            <h3 className="text-xs font-semibold text-white mb-1">Contextual Conversation</h3>
            <p className="text-white/70 text-xs">
              AI understands context
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;