import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Heart, Key, Shield } from 'lucide-react';
import { LingoDotDevEngine } from "lingo.dev/sdk";
import { useLingo } from "lingo.dev/react/client";
import { aiService } from '../../services/aiService';
import { useLegacy } from '../../contexts/LegacyContext';
import CapsuleViewer from './CapsuleViewer';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  capsuleReferences?: string[];
  legacyContext?: string;
}

const ChatInterface: React.FC = () => {
  const { activeLegacy, legacyOwner, legacyCapsules, activeGroup, recordCapsuleAccess } = useLegacy();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCapsuleId, setSelectedCapsuleId] = useState<string | null>(null);
  const [showCapsuleViewer, setShowCapsuleViewer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Lingo.dev setup
  const { locale } = useLingo();
  const lingoDotDev = new LingoDotDevEngine({
    apiKey: import.meta.env.VITE_LINGO_API_KEY || "demo-key", // Fallback for demo
  });

  // Get the current capsule state dynamically
  const selectedCapsule = selectedCapsuleId 
    ? legacyCapsules.find(c => c.id === selectedCapsuleId) 
    : null;

  // Helper function to translate bot messages
  const translateBotMessage = async (message: string): Promise<string> => {
    try {
      // Only translate if not in English
      if (locale === 'en') {
        return message;
      }
      
      const translated = await lingoDotDev.translate({
        text: message,
        targetLanguage: locale,
        sourceLanguage: 'en'
      });
      
      return translated || message;
    } catch (error) {
      console.warn('Translation failed, using original message:', error);
      return message;
    }
  };

  // Update AI service context when active legacy changes
  useEffect(() => {
    aiService.setLegacyContext(legacyCapsules, activeLegacy, legacyOwner, activeGroup);
    
    // Contextual initial message
    if (activeLegacy && legacyOwner && activeGroup) {
      const createWelcomeMessage = async () => {
        const originalMessage = `Hello, I'm the guardian angel of ${legacyOwner.name}'s legacy. You have accessed using a valid access key that gives you access to the group **"${activeGroup.name}"** with **${legacyCapsules.length} specific capsule${legacyCapsules.length > 1 ? 's' : ''}**.

**About this group:**
${activeGroup.description}

${legacyOwner.name} carefully organized this information specifically for people who have access to this group.

How can I assist you today? 💝`;

        const translatedMessage = await translateBotMessage(originalMessage);
        
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          content: translatedMessage,
          isUser: false,
          timestamp: new Date().toISOString(),
          legacyContext: activeLegacy.ownerId
        };
        setMessages([welcomeMessage]);
      };
      
      createWelcomeMessage();
    } else {
      // Message when no access key is configured
      const createNoTokenMessage = async () => {
        const originalMessage = `Hello, I'm your celestial guide. To help you find the information your loved one left for you, you first need to connect using a valid access key.

An access key is a special code that your loved one created to give you access to a specific group of capsules from their legacy. Each access key gives access only to the capsules that were assigned to that specific group.

Please add a valid access key above to begin our conversation. 💝`;

        const translatedMessage = await translateBotMessage(originalMessage);
        
        const noTokenMessage: ChatMessage = {
          id: 'no-token',
          content: translatedMessage,
          isUser: false,
          timestamp: new Date().toISOString()
        };
        setMessages([noTokenMessage]);
      };
      
      createNoTokenMessage();
    }
  }, [activeLegacy, legacyOwner, legacyCapsules, activeGroup, locale]);

  // Smooth scroll only for new messages, not on load
  useEffect(() => {
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: textToSend,
      isUser: true,
      timestamp: new Date().toISOString(),
      legacyContext: activeLegacy?.ownerId
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiService.askQuestion(textToSend);
      
      // Translate the AI response
      const translatedResponse = await translateBotMessage(response.message);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: translatedResponse,
        isUser: false,
        timestamp: new Date().toISOString(),
        capsuleReferences: response.capsuleReferences?.map(c => c.id),
        legacyContext: activeLegacy?.ownerId
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const originalErrorMessage = 'Sorry, there was an error processing your query. Please try again.';
      const translatedErrorMessage = await translateBotMessage(originalErrorMessage);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: translatedErrorMessage,
        isUser: false,
        timestamp: new Date().toISOString(),
        legacyContext: activeLegacy?.ownerId
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    if (!isLoading && activeLegacy && legacyOwner) {
      handleSendMessage(question);
    }
  };

  const handleCapsuleClick = (capsuleId: string) => {
    // Check if the capsule exists
    const capsule = legacyCapsules.find(c => c.id === capsuleId);
    
    if (!capsule) {
      console.error(`Capsule with ID ${capsuleId} not found`);
      return;
    }
    
    setSelectedCapsuleId(capsuleId);
    setShowCapsuleViewer(true);
  };

  const handleCapsuleRead = async (capsuleId: string) => {
    try {
      // Check if the capsule exists
      const capsule = legacyCapsules.find(c => c.id === capsuleId);
      if (!capsule) {
        throw new Error("This capsule no longer exists");
      }
      
      // Register capsule access
      await recordCapsuleAccess(capsuleId, 'chat');
      return true;
    } catch (error) {
      console.error('Error recording capsule access:', error);
      alert(error instanceof Error ? error.message : 'Error accessing capsule');
      return false;
    }
  };

  // Suggested questions with translations
  const getSuggestedQuestions = () => {
    const questions = {
      en: [
        "What did you leave for me?",
        "Show me everything",
        "Passwords?",
        "Messages?",
        "Instructions?",
        "Group summary"
      ],
      es: [
        "¿Qué me dejaste?",
        "Muéstrame todo",
        "¿Contraseñas?",
        "¿Mensajes?",
        "¿Instrucciones?",
        "Resumen del grupo"
      ],
      fr: [
        "Qu'avez-vous laissé pour moi?",
        "Montrez-moi tout",
        "Mots de passe?",
        "Messages?",
        "Instructions?",
        "Résumé du groupe"
      ],
      de: [
        "Was haben Sie für mich hinterlassen?",
        "Zeigen Sie mir alles",
        "Passwörter?",
        "Nachrichten?",
        "Anweisungen?",
        "Gruppenzusammenfassung"
      ]
    };

    return questions[locale as keyof typeof questions] || questions.en;
  };

  // Get translated placeholder text
  const getPlaceholderText = () => {
    const placeholders = {
      en: activeLegacy && legacyOwner
        ? `Ask ${legacyOwner.name} about the "${activeGroup?.name}" group...`
        : 'Connect with an access key to start chatting...',
      es: activeLegacy && legacyOwner
        ? `Pregúntale a ${legacyOwner.name} sobre el grupo "${activeGroup?.name}"...`
        : 'Conéctate con una clave de acceso para comenzar a chatear...',
      fr: activeLegacy && legacyOwner
        ? `Demandez à ${legacyOwner.name} à propos du groupe "${activeGroup?.name}"...`
        : 'Connectez-vous avec une clé d\'accès pour commencer à discuter...',
      de: activeLegacy && legacyOwner
        ? `Fragen Sie ${legacyOwner.name} über die Gruppe "${activeGroup?.name}"...`
        : 'Verbinden Sie sich mit einem Zugriffsschlüssel, um zu chatten...'
    };

    return placeholders[locale as keyof typeof placeholders] || placeholders.en;
  };

  // Get translated connect message
  const getConnectMessage = () => {
    const messages = {
      en: '🔐 Connect with an access key above to start chatting',
      es: '🔐 Conéctate con una clave de acceso arriba para comenzar a chatear',
      fr: '🔐 Connectez-vous avec une clé d\'accès ci-dessus pour commencer à discuter',
      de: '🔐 Verbinden Sie sich oben mit einem Zugriffsschlüssel, um zu chatten'
    };

    return messages[locale as keyof typeof messages] || messages.en;
  };

  // Get translated suggestion prompt
  const getSuggestionPrompt = () => {
    const prompts = {
      en: '💡 Suggested questions:',
      es: '💡 Preguntas sugeridas:',
      fr: '💡 Questions suggérées:',
      de: '💡 Vorgeschlagene Fragen:'
    };

    return prompts[locale as keyof typeof prompts] || prompts.en;
  };

  return (
    <div className="h-full flex flex-col bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
      {/* Header - More compact */}
      <div className="p-3 lg:p-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center ${
            activeLegacy && legacyOwner
              ? 'bg-gradient-to-br from-purple-400 to-pink-400'
              : 'bg-gradient-to-br from-gray-500 to-gray-600'
          }`}>
            {activeLegacy && legacyOwner ? (
              <Heart className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            ) : (
              <Key className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-sm lg:text-base font-semibold text-white">
              {activeLegacy && legacyOwner 
                ? `Guardian Angel of ${legacyOwner.name}`
                : 'Guardian Angel'
              }
            </h3>
            <p className="text-white/60 text-xs lg:text-sm flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>
                {activeLegacy && legacyOwner && activeGroup
                  ? `Group: ${activeGroup.name} (${legacyCapsules.length} capsules)`
                  : 'Connect with an access key to begin'
                }
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Messages - Main expanded area */}
      <div className="flex-1 p-3 lg:p-4 overflow-y-auto space-y-3 lg:space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 lg:space-x-3 max-w-[90%] lg:max-w-[85%] ${
              message.isUser ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.isUser 
                  ? 'bg-gradient-to-br from-purple-500 to-blue-500' 
                  : activeLegacy && legacyOwner
                    ? 'bg-gradient-to-br from-purple-400 to-pink-400'
                    : 'bg-gradient-to-br from-gray-500 to-gray-600'
              }`}>
                {message.isUser ? (
                  <User className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                ) : activeLegacy && legacyOwner ? (
                  <Heart className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                ) : (
                  <Key className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                )}
              </div>
              <div className={`rounded-2xl px-3 py-2 lg:px-4 lg:py-3 ${
                message.isUser
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : 'bg-white/10 text-white border border-white/10'
              }`}>
                <p className="text-xs lg:text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                {message.capsuleReferences && message.capsuleReferences.length > 0 && (
                  <div className="mt-2 lg:mt-3 pt-2 lg:pt-3 border-t border-white/20">
                    <p className="text-xs text-white/70 mb-2">Found capsules (click to view):</p>
                    <div className="space-y-1">
                      {message.capsuleReferences.map(refId => {
                        const capsule = legacyCapsules.find(c => c.id === refId);
                        if (!capsule) return null;
                        
                        return (
                          <button
                            key={refId}
                            onClick={() => handleCapsuleClick(capsule.id)}
                            className="w-full text-left text-xs bg-white/10 hover:bg-white/20 rounded px-2 py-1 flex items-center space-x-1 transition-all group"
                          >
                            <span>
                              {capsule.category === 'passwords' && '🔐'}
                              {capsule.category === 'messages' && '💌'}
                              {capsule.category === 'instructions' && '📋'}
                              {capsule.category === 'assets' && '💎'}
                            </span>
                            <span className="group-hover:text-purple-200 flex-1 truncate">{capsule.title}</span>
                            {capsule.self_destruct_enabled && (
                              <span className="text-orange-300 text-xs">🔥</span>
                            )}
                            <span className="text-white/50 text-xs">👁️</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2 lg:space-x-3 max-w-[90%] lg:max-w-[85%]">
              <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center ${
                activeLegacy && legacyOwner
                  ? 'bg-gradient-to-br from-purple-400 to-pink-400'
                  : 'bg-gradient-to-br from-gray-500 to-gray-600'
              }`}>
                {activeLegacy && legacyOwner ? (
                  <Heart className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                ) : (
                  <Key className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                )}
              </div>
              <div className="bg-white/10 border border-white/10 rounded-2xl px-3 py-2 lg:px-4 lg:py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions - Only when there's active legacy and few messages */}
      {activeLegacy && legacyOwner && messages.length <= 1 && !isLoading && (
        <div className="px-3 lg:px-4 pb-2">
          <div className="bg-white/5 rounded p-2 border border-white/10">
            <p className="text-white/60 text-xs mb-2">{getSuggestionPrompt()}</p>
            <div className="flex flex-wrap gap-1">
              {getSuggestedQuestions().map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 hover:border-purple-300/30 transition-all text-white/70 hover:text-white"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input - Input area */}
      <div className="p-3 lg:p-4 border-t border-white/10">
        <div className="flex space-x-2 lg:space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={getPlaceholderText()}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-xs lg:text-sm"
              rows={1}
              disabled={isLoading || (!activeLegacy || !legacyOwner)}
            />
          </div>
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading || (!activeLegacy || !legacyOwner)}
            className="px-3 lg:px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <Send className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="text-xs lg:text-sm">Send</span>
          </button>
        </div>
        
        {(!activeLegacy || !legacyOwner) && (
          <div className="mt-2 text-center">
            <p className="text-white/50 text-xs">
              {getConnectMessage()}
            </p>
          </div>
        )}
      </div>

      {/* Capsule Viewer Modal */}
      {showCapsuleViewer && selectedCapsule && legacyOwner && (
        <CapsuleViewer
          capsule={selectedCapsule}
          ownerName={legacyOwner.name}
          onClose={() => {
            setShowCapsuleViewer(false);
            setSelectedCapsuleId(null);
          }}
          onCapsuleRead={handleCapsuleRead}
        />
      )}
    </div>
  );
};

export default ChatInterface;