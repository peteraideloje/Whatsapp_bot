// Bot responses database
const botResponses = {
  pricing: {
    text: "💰 **Our Pricing Plans:**\n\n🟢 **Starter Plan** - $29/month\n• Up to 1,000 messages\n• Basic FAQ automation\n• Email support\n\n🔵 **Professional Plan** - $79/month\n• Up to 5,000 messages\n• Advanced AI responses\n• Priority support\n• Analytics dashboard\n\n🟡 **Enterprise Plan** - $199/month\n• Unlimited messages\n• Custom integrations\n• Dedicated support\n• White-label solution\n\nWould you like more details about any specific plan?",
    quickActions: ["starter-details", "pro-details", "enterprise-details", "contact-sales"]
  },
  
  support: {
    text: "🛠️ **Technical Support Options:**\n\n• **Setup & Integration** - Help with WhatsApp Business API setup\n• **Bot Configuration** - Customize responses and workflows\n• **Troubleshooting** - Resolve technical issues\n• **API Documentation** - Access our developer resources\n\nWhat specific technical assistance do you need?",
    quickActions: ["setup-help", "configuration", "troubleshooting", "api-docs"]
  },
  
  products: {
    text: "📦 **Our Product Suite:**\n\n🤖 **WhatsApp Business Bot**\n• Automated customer support\n• FAQ handling\n• Lead qualification\n\n📊 **Analytics Dashboard**\n• Conversation insights\n• Performance metrics\n• Customer satisfaction tracking\n\n🔗 **CRM Integration**\n• Seamless data sync\n• Customer history\n• Follow-up automation\n\nWhich product interests you most?",
    quickActions: ["bot-features", "analytics-demo", "crm-integration", "full-demo"]
  },
  
  contact: {
    text: "👤 **Connect with Our Team:**\n\nI'll connect you with one of our human representatives who can provide personalized assistance.\n\n**Available Support Hours:**\n• Monday - Friday: 9 AM - 6 PM EST\n• Saturday: 10 AM - 4 PM EST\n• Sunday: Closed\n\n**Current Status:** Our team is online and ready to help!\n\nPlease provide your name and briefly describe how we can assist you:",
    quickActions: ["leave-message", "schedule-call", "urgent-support"]
  },
  
  // Fallback responses
  greeting: [
    "Hello! How can I help you today?",
    "Hi there! What can I assist you with?",
    "Welcome! I'm here to help. What do you need?"
  ],
  
  fallback: [
    "I'm not sure I understand that. Could you please rephrase your question?",
    "That's a great question! Let me connect you with a human representative who can better assist you.",
    "I don't have specific information about that. Would you like to speak with our support team?"
  ],
  
  thanks: [
    "You're welcome! Is there anything else I can help you with?",
    "Happy to help! Feel free to ask if you have more questions.",
    "Glad I could assist! What else can I do for you?"
  ]
};

// FAQ keywords mapping
const faqKeywords = {
  pricing: ['price', 'cost', 'plan', 'pricing', 'fee', 'subscription', 'payment'],
  support: ['help', 'support', 'technical', 'setup', 'problem', 'issue', 'bug'],
  products: ['product', 'feature', 'service', 'what do you offer', 'capabilities'],
  contact: ['human', 'person', 'representative', 'agent', 'talk to someone', 'speak'],
  greeting: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'],
  thanks: ['thank', 'thanks', 'appreciate', 'grateful']
};

class ChatBot {
  constructor() {
    this.chatMessages = document.getElementById('chat-messages');
    this.messageInput = document.getElementById('message-input');
    this.sendBtn = document.getElementById('send-btn');
    this.quickActions = document.getElementById('quick-actions');
    this.typingIndicator = document.getElementById('typing-indicator');
    this.backBtn = document.getElementById('back-btn');
    
    this.conversationHistory = [];
    this.isTyping = false;
    this.sessionId = this.generateSessionId();
    this.apiBase = 'http://localhost:3001/api';
    
    this.initializeEventListeners();
    this.showQuickActions();
  }
  
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  initializeEventListeners() {
    // Send message on button click
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    
    // Send message on Enter key
    this.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    // Quick action buttons
    this.quickActions.addEventListener('click', (e) => {
      if (e.target.classList.contains('quick-btn')) {
        const action = e.target.dataset.action;
        this.handleQuickAction(action);
      }
    });
    
    // Back button
    this.backBtn.addEventListener('click', () => {
      window.location.href = '/';
    });
    
    // Auto-resize input
    this.messageInput.addEventListener('input', () => {
      this.messageInput.style.height = 'auto';
      this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
    });
  }
  
  async sendMessage() {
    const message = this.messageInput.value.trim();
    if (!message || this.isTyping) return;
    
    this.addUserMessage(message);
    this.messageInput.value = '';
    this.messageInput.style.height = 'auto';
    this.hideQuickActions();
    
    // Save user message to backend
    await this.saveMessage(message, 'user');
    
    // Process bot response
    setTimeout(() => this.processBotResponse(message), 500);
  }
  
  async handleQuickAction(action) {
    const actionTexts = {
      pricing: "I'd like to know about your pricing plans",
      support: "I need technical support",
      products: "Tell me about your products",
      contact: "I want to talk to a human representative"
    };
    
    const message = actionTexts[action] || action;
    this.addUserMessage(message);
    this.hideQuickActions();
    
    // Save user message to backend
    await this.saveMessage(message, 'user');
    
    setTimeout(() => this.processBotResponse(action), 500);
  }
  
  addUserMessage(message) {
    const messageElement = this.createMessageElement(message, 'user');
    this.chatMessages.appendChild(messageElement);
    this.scrollToBottom();
    
    this.conversationHistory.push({
      type: 'user',
      message: message,
      timestamp: new Date()
    });
  }
  
  async addBotMessage(message, showQuickActions = false) {
    const messageElement = this.createMessageElement(message, 'bot');
    this.chatMessages.appendChild(messageElement);
    this.scrollToBottom();
    
    this.conversationHistory.push({
      type: 'bot',
      message: message,
      timestamp: new Date()
    });
    
    // Save bot message to backend
    await this.saveMessage(message, 'bot');
    
    if (showQuickActions) {
      setTimeout(() => this.showQuickActions(), 1000);
    }
  }
  
  async saveMessage(message, sender) {
    try {
      await fetch(`${this.apiBase}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          sender,
          sessionId: this.sessionId,
          userId: 'anonymous'
        })
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }
  
  createMessageElement(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    const text = document.createElement('div');
    text.className = 'message-text';
    text.innerHTML = this.formatMessage(message);
    
    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = this.getCurrentTime();
    
    bubble.appendChild(text);
    bubble.appendChild(time);
    messageDiv.appendChild(bubble);
    
    return messageDiv;
  }
  
  formatMessage(message) {
    // Convert markdown-style formatting
    return message
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }
  
  getCurrentTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  async processBotResponse(userMessage) {
    this.showTypingIndicator();
    
    setTimeout(async () => {
      this.hideTypingIndicator();
      const response = this.generateBotResponse(userMessage.toLowerCase());
      await this.addBotMessage(response.text, response.showQuickActions);
      
      // Save analytics data
      await this.saveAnalytics(userMessage, response.text, response.escalated);
    }, 1500 + Math.random() * 1000); // Random delay for realism
  }
  
  generateBotResponse(userMessage) {
    // Check for specific actions first
    if (botResponses[userMessage]) {
      return {
        text: botResponses[userMessage].text,
        showQuickActions: false,
        escalated: userMessage === 'contact'
      };
    }
    
    // Check for keyword matches
    for (const [category, keywords] of Object.entries(faqKeywords)) {
      if (keywords.some(keyword => userMessage.includes(keyword))) {
        if (category === 'greeting') {
          return {
            text: this.getRandomResponse(botResponses.greeting),
            showQuickActions: true,
            escalated: false
          };
        } else if (category === 'thanks') {
          return {
            text: this.getRandomResponse(botResponses.thanks),
            showQuickActions: true,
            escalated: false
          };
        } else if (botResponses[category]) {
          return {
            text: botResponses[category].text,
            showQuickActions: false,
            escalated: category === 'contact'
          };
        }
      }
    }
    
    // Fallback response
    return {
      text: this.getRandomResponse(botResponses.fallback),
      showQuickActions: true,
      escalated: true
    };
  }
  
  async saveAnalytics(userQuery, botResponse, escalated) {
    try {
      await fetch(`${this.apiBase}/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          userQuery,
          botResponse,
          escalated: escalated || false
        })
      });
    } catch (error) {
      console.error('Error saving analytics:', error);
    }
  }
  
  getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  showTypingIndicator() {
    this.isTyping = true;
    this.typingIndicator.style.display = 'block';
    this.scrollToBottom();
  }
  
  hideTypingIndicator() {
    this.isTyping = false;
    this.typingIndicator.style.display = 'none';
  }
  
  showQuickActions() {
    this.quickActions.style.display = 'flex';
  }
  
  hideQuickActions() {
    this.quickActions.style.display = 'none';
  }
  
  scrollToBottom() {
    setTimeout(() => {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }, 100);
  }
}

// Initialize chat bot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ChatBot();
});

// Add some CSS animations and interactions
document.addEventListener('DOMContentLoaded', () => {
  // Add click animation to buttons
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function() {
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 150);
    });
  });
});