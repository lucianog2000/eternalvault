import { mockDbService } from './mockDbService';

interface AIResponse {
  message: string;
  capsuleReferences?: any[];
  confidence: number;
  legacyOwnerName?: string;
}

class AIService {
  private legacyCapsules: any[] = [];
  private activeLegacy: any = null;
  private legacyOwner: any = null;
  private activeGroup: any = null;

  setLegacyContext(capsules: any[], legacy: any, owner: any, group?: any) {
    this.legacyCapsules = capsules;
    this.activeLegacy = legacy;
    this.legacyOwner = owner;
    this.activeGroup = group;
  }

  private generateCapsuleSummary(): string {
    if (this.legacyCapsules.length === 0) {
      return `No capsules available with this access key.`;
    }

    // Separate active and destroyed capsules
    const activeCapsules = this.legacyCapsules.filter(c => !c.isDestroyed);
    const destroyedCapsules = this.legacyCapsules.filter(c => c.isDestroyed);

    const categoryGroups = activeCapsules.reduce((groups, capsule) => {
      const category = capsule.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(capsule);
      return groups;
    }, {} as Record<string, any[]>);

    const categoryNames = {
      passwords: 'Passwords and Credentials',
      messages: 'Personal Messages',
      instructions: 'Instructions',
      assets: 'Digital Assets'
    };

    let summary = `${this.legacyOwner?.name} has given you access to **${this.legacyCapsules.length} capsule${this.legacyCapsules.length > 1 ? 's' : ''}** from the group "${this.activeGroup?.name || 'Unnamed'}":\n\n`;

    // Show owner status information
    if (this.legacyOwner?.isDeceased) {
      summary += `💔 **Owner status:** ${this.legacyOwner.name} passed away on ${new Date(this.legacyOwner.deceasedAt).toLocaleDateString()}.\n\n`;
    } else {
      summary += `💓 **Owner status:** ${this.legacyOwner.name} is still alive (last confirmation: ${new Date(this.legacyOwner.lastLifeConfirmation || this.legacyOwner.lastActivity).toLocaleDateString()}).\n\n`;
    }

    // Show active capsules
    if (activeCapsules.length > 0) {
      summary += `## 📂 **Available Capsules** (${activeCapsules.length}):\n\n`;
      
      Object.entries(categoryGroups).forEach(([category, capsules]) => {
        const categoryName = categoryNames[category as keyof typeof categoryNames] || category;
        summary += `**${categoryName}** (${capsules.length} capsule${capsules.length > 1 ? 's' : ''}):\n`;
        
        capsules.forEach((capsule, index) => {
          const destructionWarning = capsule.selfDestruct?.enabled 
            ? ` 🔥 (${capsule.selfDestruct.maxReads - capsule.selfDestruct.currentReads} read${capsule.selfDestruct.maxReads - capsule.selfDestruct.currentReads !== 1 ? 's' : ''} remaining)`
            : '';
          summary += `   ${index + 1}. ${capsule.title}${destructionWarning}\n`;
        });
        summary += '\n';
      });
    }

    // Show destroyed capsules if any
    if (destroyedCapsules.length > 0) {
      summary += `## 💀 **Destroyed Capsules** (${destroyedCapsules.length}):\n\n`;
      destroyedCapsules.forEach((capsule, index) => {
        const destroyedDate = capsule.destroyedAt ? new Date(capsule.destroyedAt).toLocaleDateString() : 'Unknown date';
        summary += `   ${index + 1}. ~~${capsule.title}~~ - Destroyed on ${destroyedDate}\n`;
      });
      summary += '\n';
    }

    summary += `**Group information:** ${this.activeGroup?.description || 'No description'}\n\n`;
    
    if (activeCapsules.length > 0) {
      summary += `You can ask me specifically about any of these available capsules. For example: "Show me the passwords" or "What does the message for me say?"`;
    } else {
      summary += `All capsules in this group have been destroyed. No content is available for consultation.`;
    }

    return summary;
  }

  private getNoTokenResponse(): AIResponse {
    return {
      message: `🔐 **Access Key Required**

To help you find the information you need, you must first connect using a valid access key.

**How to connect?**
1. **If you have an access key:** Click "Add Access Key" above and enter the code
2. **If you already have available legacies:** Select the specific legacy you want to chat with

**What is an access key?**
It's a special code that your loved one created to give you access to a specific group of capsules from their legacy. Each access key gives access only to the capsules that were assigned to that specific group.

**Example access keys to try:**
• \`evault_juan_familia_2024_abc123def456\` - Juan García's family access (3 capsules) - ⚠️ Requires Juan to be deceased
• \`evault_juan_abogado_2024_xyz789ghi012\` - Juan García's legal access (1 capsule) - ⚠️ Requires Juan to be deceased
• \`evault_juan_amigo_2024_mno345pqr678\` - Juan García's friendship access (1 capsule) - ⚠️ Requires Juan to be deceased
• \`evault_maria_nietos_2024_stu901vwx234\` - María González's grandchildren access (2 capsules) - ✅ María has passed away
• \`evault_carlos_tech_2024_def456ghi789\` - Carlos Mendoza's technical access (1 capsule) - ✅ Carlos has passed away
• \`evault_test_alive_2024_test123alive456\` - Test user (1 capsule) - ⚠️ Requires user to be deceased

**💡 Note about Life Verification:**
Some access keys only activate after the owner's death, ensuring maximum privacy while the person is still alive.

Each access key will give you access only to a specific group of capsules. 💝`,
      confidence: 1.0
    };
  }

  private getOwnerAliveResponse(): AIResponse {
    return {
      message: `🚫 **Access Restricted - Owner Still Alive**

I cannot give you access to ${this.legacyOwner?.name}'s capsules because our system has detected they are still alive.

**Why is access restricted?**
• **Privacy protection:** EternalVault protects personal information while the person is still alive
• **Automatic verification:** The system regularly checks if the owner is still active
• **Last life confirmation:** ${new Date(this.legacyOwner?.lastLifeConfirmation || this.legacyOwner?.lastActivity).toLocaleString()}

**When will access be activated?**
Access will automatically activate when:
1. ${this.legacyOwner?.name} doesn't confirm their life status during the configured period
2. Or when manually marked as deceased in the system

**What can you do?**
• **If you think there's an error:** Contact ${this.legacyOwner?.name} directly
• **If you have other access keys:** Try keys from other legacies
• **If you're a direct family member:** Some family keys may have immediate access

**Group information:**
• **Group:** ${this.activeGroup?.name}
• **Description:** ${this.activeGroup?.description}
• **Owner:** ${this.legacyOwner?.name} (Alive)

This system ensures that private information remains protected until the appropriate time. 🔒`,
      confidence: 1.0,
      legacyOwnerName: this.legacyOwner?.name
    };
  }

  private getRestrictedAccessResponse(requestedInfo: string): AIResponse {
    return {
      message: `🔒 **Information Not Available**

The information you're requesting about "${requestedInfo}" is not available in the group of capsules you currently have access to.

${this.legacyOwner?.name} organized their legacy into different groups with specific access keys to protect privacy and ensure each person receives only the information specifically intended for them.

**Your current access key gives access to:**
**Group:** ${this.activeGroup?.name || 'Unnamed'}
**Description:** ${this.activeGroup?.description || 'No description'}
**Owner status:** ${this.legacyOwner?.isDeceased ? 'Deceased' : 'Alive'}

**Available capsules:**
${this.legacyCapsules.filter(c => !c.isDestroyed).map(c => `• ${c.title}`).join('\n')}

**What can you do?**
• If you have a different access key, you can add it to access more information
• Consult with other family members or trusted people who may have different access keys
• Ask me about the information that IS available with your current access key

Would you like me to help you with any of these available capsules? 💝`,
      confidence: 0.9,
      legacyOwnerName: this.legacyOwner?.name
    };
  }

  // Helper function to normalize text for better matching across languages
  private normalizeText(text: string): string {
    return text.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  // Enhanced keyword matching that works across languages
  private matchesKeywords(text: string, keywords: string[]): boolean {
    const normalizedText = this.normalizeText(text);
    return keywords.some(keyword => normalizedText.includes(this.normalizeText(keyword)));
  }

  async askQuestion(question: string): Promise<AIResponse> {
    // AI processing simulation
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check if there's an active legacy configured
    if (!this.activeLegacy || !this.legacyOwner) {
      return this.getNoTokenResponse();
    }

    // Check if owner is alive and access is restricted
    if (!this.legacyOwner.isDeceased && this.activeLegacy.requiresOwnerDeceased) {
      return this.getOwnerAliveResponse();
    }

    const ownerName = this.legacyOwner.name;
    
    let response: AIResponse = {
      message: `Sorry, I couldn't find specific information about your query in the available capsules from ${ownerName}'s legacy. Could you be more specific about what you need?`,
      confidence: 0.3,
      legacyOwnerName: ownerName
    };

    // Filter non-destroyed capsules for responses
    const availableCapsules = this.legacyCapsules.filter(c => !c.isDestroyed);
    const destroyedCapsules = this.legacyCapsules.filter(c => c.isDestroyed);

    // Enhanced keyword matching for multiple languages
    const everythingKeywords = [
      'everything', 'todo', 'tout', 'alles', 'all', 'todos', 'all capsules', 'todas las capsulas',
      'what did they leave', 'que me dejaste', 'qu\'avez-vous laisse', 'was haben sie hinterlassen',
      'what is there', 'que hay', 'qu\'y a-t-il', 'was gibt es',
      'show all', 'muestra todo', 'montrez tout', 'zeigen sie alles',
      'see all', 've todo', 'voir tout', 'alles sehen',
      'list', 'lista', 'liste', 'auflisten',
      'summary', 'resumen', 'resume', 'zusammenfassung',
      'what information', 'que informacion', 'quelles informations', 'welche informationen'
    ];

    const greetingKeywords = [
      'hello', 'hola', 'bonjour', 'hallo', 'hi', 'hey',
      'help', 'ayuda', 'aide', 'hilfe',
      'what can you do', 'que puedes hacer', 'que pouvez-vous faire', 'was konnen sie tun'
    ];

    const passwordKeywords = [
      'password', 'passwords', 'contraseña', 'contraseñas', 'mot de passe', 'mots de passe', 'passwort', 'passworter',
      'bank', 'banco', 'banque', 'banking', 'bancario', 'bancaire',
      'account', 'cuenta', 'compte', 'konto', 'accounts', 'cuentas', 'comptes', 'konten',
      'login', 'acceso', 'connexion', 'anmeldung', 'credential', 'credencial', 'identifiant', 'berechtigung'
    ];

    const messageKeywords = [
      'message', 'messages', 'mensaje', 'mensajes', 'lettre', 'lettres', 'nachricht', 'nachrichten',
      'letter', 'carta', 'brief', 'farewell', 'despedida', 'adieu', 'abschied',
      'for me', 'para mi', 'pour moi', 'fur mich', 'personal', 'personal', 'personnel', 'personlich'
    ];

    const instructionKeywords = [
      'instruction', 'instructions', 'instruccion', 'instrucciones', 'instruction', 'instructions', 'anweisung', 'anweisungen',
      'process', 'proceso', 'processus', 'prozess', 'how', 'como', 'comment', 'wie',
      'domain', 'dominio', 'domaine', 'transfer', 'transferir', 'transferer', 'ubertragen',
      'recipe', 'receta', 'recette', 'rezept', 'recipes', 'recetas', 'recettes', 'rezepte'
    ];

    const assetKeywords = [
      'asset', 'assets', 'activo', 'activos', 'actif', 'actifs', 'vermogen',
      'digital', 'digital', 'numerique', 'digital', 'wallet', 'billetera', 'portefeuille', 'brieftasche',
      'crypto', 'cryptocurrency', 'criptomoneda', 'cryptomonnaie', 'kryptowahrung'
    ];

    const statusKeywords = [
      'alive', 'vivo', 'vivant', 'lebendig', 'dead', 'muerto', 'mort', 'tot',
      'deceased', 'fallecido', 'decede', 'verstorben', 'status', 'estado', 'statut', 'zustand'
    ];

    const destroyedKeywords = [
      'destroyed', 'destruido', 'detruit', 'zerstort', 'destruction', 'destruccion', 'destruction', 'zerstorung',
      'deleted', 'eliminado', 'supprime', 'geloscht'
    ];

    const familyKeywords = [
      'dad', 'papa', 'pere', 'vater', 'father', 'padre', 'pere', 'vater',
      'mom', 'mama', 'mere', 'mutter', 'mother', 'madre', 'mere', 'mutter',
      'grandma', 'abuela', 'grand-mere', 'oma', 'grandpa', 'abuelo', 'grand-pere', 'opa'
    ];

    const keyTokenKeywords = [
      'key', 'token', 'access', 'llave', 'clave', 'acceso', 'cle', 'acces', 'schlussel', 'zugang'
    ];

    // GetAll command - show all available capsules
    if (this.matchesKeywords(question, everythingKeywords)) {
      const summary = this.generateCapsuleSummary();
      response = {
        message: summary,
        capsuleReferences: availableCapsules,
        confidence: 0.98,
        legacyOwnerName: ownerName
      };
    }
    // Contextual and empathetic responses
    else if (this.matchesKeywords(question, greetingKeywords)) {
      const ownerStatus = this.legacyOwner.isDeceased 
        ? `passed away on ${new Date(this.legacyOwner.deceasedAt).toLocaleDateString()}`
        : `is still alive (last confirmation: ${new Date(this.legacyOwner.lastLifeConfirmation || this.legacyOwner.lastActivity).toLocaleDateString()})`;

      response = {
        message: `Hello, I'm the guardian angel of ${ownerName}'s legacy. I'm here to help you find the information they left specifically for you.

**Owner status:** ${ownerName} ${ownerStatus}.

Your access key gives you access to the group **"${this.activeGroup?.name || 'Unnamed'}"** with ${this.legacyCapsules.length} total capsule${this.legacyCapsules.length > 1 ? 's' : ''} (${availableCapsules.length} available, ${destroyedCapsules.length} destroyed).

**About this group:**
${this.activeGroup?.description || 'No description available'}

You can ask me about:
• Passwords and credentials
• Personal messages 
• Important instructions
• Digital assets

You can also ask me to show you "everything they left" to see a complete summary. How can I assist you today?`,
        confidence: 1.0,
        legacyOwnerName: ownerName
      };
    } 
    else if (this.matchesKeywords(question, passwordKeywords)) {
      const passwordCapsules = availableCapsules.filter(c => c.category === 'passwords');
      if (passwordCapsules.length > 0) {
        response = {
          message: `I found ${passwordCapsules.length} capsule${passwordCapsules.length > 1 ? 's' : ''} with passwords that ${ownerName} prepared for you. Includes banking information and important credentials.

**Available password capsules:**
${passwordCapsules.map(c => {
  const destructionInfo = c.selfDestruct?.enabled 
    ? ` 🔥 (${c.selfDestruct.maxReads - c.selfDestruct.currentReads} read${c.selfDestruct.maxReads - c.selfDestruct.currentReads !== 1 ? 's' : ''} remaining)`
    : '';
  return `• ${c.title}${destructionInfo}`;
}).join('\n')}

Click on any to view its complete content.

${passwordCapsules.some(c => c.selfDestruct?.enabled) ? '\n⚠️ **Note:** Some capsules have self-destruction enabled. They will be destroyed after reaching the read limit.' : ''}`,
          capsuleReferences: passwordCapsules,
          confidence: 0.95,
          legacyOwnerName: ownerName
        };
      } else {
        return this.getRestrictedAccessResponse('banking passwords');
      }
    } 
    else if (this.matchesKeywords(question, messageKeywords)) {
      const messageCapsules = availableCapsules.filter(c => c.category === 'messages');
      if (messageCapsules.length > 0) {
        response = {
          message: `Yes, ${ownerName} left ${messageCapsules.length} very special message${messageCapsules.length > 1 ? 's' : ''} for you. They are words full of love that they wanted to share specifically with you.

**Available messages:**
${messageCapsules.map(c => {
  const destructionWarning = c.selfDestruct?.enabled 
    ? ` 🔥 (${c.selfDestruct.maxReads - c.selfDestruct.currentReads} read${c.selfDestruct.maxReads - c.selfDestruct.currentReads !== 1 ? 's' : ''} remaining)`
    : '';
  return `• ${c.title}${destructionWarning}`;
}).join('\n')}

${messageCapsules.some(c => c.selfDestruct?.enabled) ? '\n⚠️ **Note:** Some messages have self-destruction enabled. They will be destroyed after being read the maximum allowed number of times.' : ''}`,
          capsuleReferences: messageCapsules,
          confidence: 0.98,
          legacyOwnerName: ownerName
        };
      } else {
        return this.getRestrictedAccessResponse('personal messages');
      }
    } 
    else if (this.matchesKeywords(question, instructionKeywords)) {
      const instructionCapsules = availableCapsules.filter(c => c.category === 'instructions');
      if (instructionCapsules.length > 0) {
        response = {
          message: `${ownerName} left ${instructionCapsules.length} set${instructionCapsules.length > 1 ? 's' : ''} of instructions specifically for you. These include detailed steps they considered important.

**Available instructions:**
${instructionCapsules.map(c => {
  const destructionInfo = c.selfDestruct?.enabled 
    ? ` 🔥 (${c.selfDestruct.maxReads - c.selfDestruct.currentReads} read${c.selfDestruct.maxReads - c.selfDestruct.currentReads !== 1 ? 's' : ''} remaining)`
    : '';
  return `• ${c.title}${destructionInfo}`;
}).join('\n')}

These instructions may include processes, document locations, family recipes or important procedures.`,
          capsuleReferences: instructionCapsules,
          confidence: 0.92,
          legacyOwnerName: ownerName
        };
      } else {
        return this.getRestrictedAccessResponse('instructions');
      }
    } 
    else if (this.matchesKeywords(question, assetKeywords)) {
      const assetCapsules = availableCapsules.filter(c => c.category === 'assets');
      if (assetCapsules.length > 0) {
        response = {
          message: `I've located information about ${assetCapsules.length} digital asset${assetCapsules.length > 1 ? 's' : ''} that ${ownerName} wanted you to have.

**Available digital assets:**
${assetCapsules.map(c => `• ${c.title}`).join('\n')}`,
          capsuleReferences: assetCapsules,
          confidence: 0.90,
          legacyOwnerName: ownerName
        };
      } else {
        return this.getRestrictedAccessResponse('digital assets');
      }
    } 
    else if (this.matchesKeywords(question, statusKeywords)) {
      const ownerStatus = this.legacyOwner.isDeceased 
        ? `passed away on ${new Date(this.legacyOwner.deceasedAt).toLocaleDateString()}`
        : `is still alive`;

      response = {
        message: `**${ownerName}'s status:** ${ownerName} ${ownerStatus}.

${this.legacyOwner.isDeceased ? 
  `💔 According to our records, ${ownerName} passed away on ${new Date(this.legacyOwner.deceasedAt).toLocaleDateString()}. That's why you have access to these capsules from their legacy.` :
  `💓 ${ownerName} is still alive according to our life verification system. Their last confirmation was on ${new Date(this.legacyOwner.lastLifeConfirmation || this.legacyOwner.lastActivity).toLocaleDateString()}.`
}

**Your access information:**
• **Group:** ${this.activeGroup?.name}
• **Total capsules:** ${this.legacyCapsules.length}
• **Available capsules:** ${availableCapsules.length}
• **Requires death:** ${this.activeLegacy.requiresOwnerDeceased ? 'Yes' : 'No'}

${!this.legacyOwner.isDeceased && this.activeLegacy.requiresOwnerDeceased ? 
  'Access to these capsules is restricted while the owner is still alive, to protect their privacy.' :
  'You have full access to the capsules in this group.'
}`,
        confidence: 1.0,
        legacyOwnerName: ownerName
      };
    } 
    else if (this.matchesKeywords(question, destroyedKeywords)) {
      if (destroyedCapsules.length > 0) {
        response = {
          message: `There are ${destroyedCapsules.length} capsule${destroyedCapsules.length > 1 ? 's' : ''} that ${destroyedCapsules.length > 1 ? 'were already destroyed' : 'was already destroyed'} in this group:

**Destroyed capsules:**
${destroyedCapsules.map(c => `• ${c.title} - Destroyed on ${new Date(c.destroyedAt || '').toLocaleDateString()}`).join('\n')}

These capsules had self-destruction configured and already reached their read limit. Their content is no longer available and cannot be recovered.

**Still available capsules:** ${availableCapsules.length}

${availableCapsules.length > 0 ? 'You can consult the capsules that are still available.' : 'Unfortunately, all capsules in this group have been destroyed.'}`,
          confidence: 0.90,
          legacyOwnerName: ownerName
        };
      } else {
        response = {
          message: `There are no destroyed capsules in this group. All ${availableCapsules.length} capsules are available for consultation.

${availableCapsules.some(c => c.selfDestruct?.enabled) ? 
  'However, some capsules have self-destruction configured and will be destroyed after being read the maximum allowed number of times.' : 
  'None of the capsules have self-destruction configured, so they will remain available indefinitely.'
}`,
          confidence: 0.85,
          legacyOwnerName: ownerName
        };
      }
    } 
    else if (this.matchesKeywords(question, familyKeywords)) {
      // General search when mentioning family relationship
      if (availableCapsules.length > 0) {
        response = {
          message: `${ownerName} left ${this.legacyCapsules.length} capsule${this.legacyCapsules.length > 1 ? 's' : ''} specifically in the group "${this.activeGroup?.name}" for you. Your access key gives you access to information they considered appropriate to share with you.

**Current group:** ${this.activeGroup?.name}
**Description:** ${this.activeGroup?.description}
**Owner status:** ${this.legacyOwner.isDeceased ? 'Deceased' : 'Alive'}

**Capsule status:**
• **Available:** ${availableCapsules.length}
• **Destroyed:** ${destroyedCapsules.length}

**Available capsules:**
${availableCapsules.slice(0, 3).map(c => {
  const destructionInfo = c.selfDestruct?.enabled 
    ? ` 🔥 (${c.selfDestruct.maxReads - c.selfDestruct.currentReads} read${c.selfDestruct.maxReads - c.selfDestruct.currentReads !== 1 ? 's' : ''} remaining)`
    : '';
  return `• ${c.title}${destructionInfo}`;
}).join('\n')}
${availableCapsules.length > 3 ? `... and ${availableCapsules.length - 3} more` : ''}`,
          capsuleReferences: availableCapsules.slice(0, 3),
          confidence: 0.85,
          legacyOwnerName: ownerName
        };
      } else {
        response = {
          message: `${ownerName} had created ${this.legacyCapsules.length} capsule${this.legacyCapsules.length > 1 ? 's' : ''} in the group "${this.activeGroup?.name}" for you, but unfortunately all have been destroyed.

**Destroyed capsules:**
${destroyedCapsules.map(c => `• ${c.title} - Destroyed on ${new Date(c.destroyedAt || '').toLocaleDateString()}`).join('\n')}

These capsules had self-destruction configured and already reached their read limit. Their content is no longer available.

If you have other access keys, you can add them to access additional groups that ${ownerName} may have created.`,
          confidence: 0.80,
          legacyOwnerName: ownerName
        };
      }
    } 
    else if (this.matchesKeywords(question, keyTokenKeywords)) {
      response = {
        message: `You currently have access to the group **"${this.activeGroup?.name}"** from ${ownerName}'s legacy.

**Your access information:**
• Owner: ${ownerName} (${this.legacyOwner.isDeceased ? 'Deceased' : 'Alive'})
• Group: ${this.activeGroup?.name}
• Description: ${this.activeGroup?.description}
• Total capsules: ${this.legacyCapsules.length}
• Available capsules: ${availableCapsules.length}
• Destroyed capsules: ${destroyedCapsules.length}
• Access granted: ${new Date(this.activeLegacy.grantedAt).toLocaleDateString()}
• Requires death: ${this.activeLegacy.requiresOwnerDeceased ? 'Yes' : 'No'}

**Specific available capsules:**
${availableCapsules.map(c => {
  const destructionWarning = c.selfDestruct?.enabled ? ' 🔥' : '';
  return `• ${c.title}${destructionWarning}`;
}).join('\n')}

${destroyedCapsules.length > 0 ? `\n**Destroyed capsules:**\n${destroyedCapsules.map(c => `• ~~${c.title}~~ (destroyed)`).join('\n')}\n` : ''}

If you have other access keys, you can add them to access additional groups that ${ownerName} may have created for different purposes.`,
        confidence: 0.95,
        legacyOwnerName: ownerName
      };
    }

    return response;
  }
}

export const aiService = new AIService();