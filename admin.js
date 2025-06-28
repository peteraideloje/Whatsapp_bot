// Enhanced Admin Dashboard JavaScript
class AdminDashboard {
  constructor() {
    this.apiBase = 'http://localhost:3001/api';
    this.currentTab = 'dashboard';
    this.faqs = [];
    this.conversations = [];
    this.analytics = {};
    this.user = null;
    this.token = localStorage.getItem('adminToken');
    
    this.checkAuthentication();
  }
  
  async checkAuthentication() {
    if (!this.token) {
      window.location.href = '/admin-login.html';
      return;
    }

    try {
      const response = await fetch(`${this.apiBase}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.user = data.user;
        this.initializeEventListeners();
        this.loadDashboardData();
        this.updateUserInfo();
      } else {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin-login.html';
      }
    } catch (error) {
      console.error('Authentication error:', error);
      window.location.href = '/admin-login.html';
    }
  }

  updateUserInfo() {
    // Add user info to header if needed
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.innerHTML = `
      <span>Welcome, ${this.user.name}</span>
      <button class="btn-secondary" onclick="adminDashboard.logout()">Logout</button>
    `;
    
    const adminActions = document.querySelector('.admin-actions');
    adminActions.appendChild(userInfo);
  }

  logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin-login.html';
  }
  
  initializeEventListeners() {
    // Tab navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.target.dataset.tab;
        this.switchTab(tab);
      });
    });
    
    // FAQ management
    document.getElementById('add-faq-btn').addEventListener('click', () => {
      this.openFAQModal();
    });
    
    document.getElementById('modal-close').addEventListener('click', () => {
      this.closeFAQModal();
    });
    
    document.getElementById('cancel-btn').addEventListener('click', () => {
      this.closeFAQModal();
    });
    
    document.getElementById('faq-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveFAQ();
    });
    
    // Search and filters
    document.getElementById('conversation-search').addEventListener('input', (e) => {
      this.filterConversations(e.target.value);
    });
    
    document.getElementById('analytics-period').addEventListener('change', (e) => {
      this.loadAnalytics(e.target.value);
    });
  }
  
  async makeAuthenticatedRequest(url, options = {}) {
    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    return fetch(url, { ...options, ...defaultOptions });
  }
  
  switchTab(tabName) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    this.currentTab = tabName;
    
    // Load tab-specific data
    switch(tabName) {
      case 'dashboard':
        this.loadDashboardData();
        break;
      case 'faqs':
        this.loadFAQs();
        break;
      case 'conversations':
        this.loadConversations();
        break;
      case 'analytics':
        this.loadAnalytics();
        break;
      case 'broadcasts':
        this.loadBroadcasts();
        break;
    }
  }
  
  async loadDashboardData() {
    try {
      const response = await fetch(`${this.apiBase}/analytics`);
      const data = await response.json();
      
      // Update stats with enhanced data
      document.getElementById('total-conversations').textContent = 
        data.totalConversations?.[0]?.count || 0;
      document.getElementById('total-messages').textContent = 
        data.totalMessages?.[0]?.count || 0;
      document.getElementById('escalation-rate').textContent = 
        `${Math.round(data.escalationRate?.[0]?.rate || 0)}%`;
      document.getElementById('avg-satisfaction').textContent = 
        (data.avgSatisfaction?.[0]?.avg || 0).toFixed(1);
      
      // Update categories chart
      this.updateCategoriesChart(data.topCategories || []);
      
      // Update intent distribution if available
      if (data.intentDistribution) {
        this.updateIntentChart(data.intentDistribution);
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.showNotification('Error loading dashboard data', 'error');
    }
  }
  
  updateCategoriesChart(categories) {
    const container = document.getElementById('categories-chart');
    container.innerHTML = '';
    
    if (categories.length === 0) {
      container.innerHTML = '<p class="no-data">No data available</p>';
      return;
    }
    
    categories.forEach(category => {
      const item = document.createElement('div');
      item.className = 'category-item';
      item.innerHTML = `
        <div class="category-name">${category.category}</div>
        <div class="category-count">${category.count} FAQs</div>
      `;
      container.appendChild(item);
    });
  }

  updateIntentChart(intents) {
    // Add intent distribution visualization if container exists
    const intentContainer = document.getElementById('intent-chart');
    if (intentContainer) {
      intentContainer.innerHTML = '';
      
      intents.forEach(intent => {
        const item = document.createElement('div');
        item.className = 'intent-item';
        item.innerHTML = `
          <div class="intent-name">${intent.intent}</div>
          <div class="intent-count">${intent.count} queries</div>
        `;
        intentContainer.appendChild(item);
      });
    }
  }
  
  async loadFAQs() {
    try {
      const response = await fetch(`${this.apiBase}/faqs`);
      this.faqs = await response.json();
      this.renderFAQs();
    } catch (error) {
      console.error('Error loading FAQs:', error);
      this.showNotification('Error loading FAQs', 'error');
    }
  }
  
  renderFAQs() {
    const container = document.getElementById('faqs-list');
    container.innerHTML = '';
    
    if (this.faqs.length === 0) {
      container.innerHTML = '<p class="no-data">No FAQs found. Add your first FAQ to get started.</p>';
      return;
    }
    
    this.faqs.forEach(faq => {
      const faqElement = document.createElement('div');
      faqElement.className = 'faq-item';
      faqElement.innerHTML = `
        <div class="faq-header">
          <div class="faq-category">${faq.category}</div>
          <div class="faq-actions">
            <button class="btn-icon" onclick="adminDashboard.editFAQ(${faq.id})" title="Edit FAQ">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
            <button class="btn-icon ${faq.active ? '' : 'inactive'}" onclick="adminDashboard.toggleFAQ(${faq.id})" title="${faq.active ? 'Deactivate' : 'Activate'} FAQ">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="${faq.active ? 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' : 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z'}"/>
              </svg>
            </button>
            <button class="btn-icon delete" onclick="adminDashboard.deleteFAQ(${faq.id})" title="Delete FAQ">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="faq-question">${faq.question}</div>
        <div class="faq-answer">${this.formatText(faq.answer)}</div>
        <div class="faq-keywords">
          <strong>Keywords:</strong> ${faq.keywords || 'None'}
        </div>
        ${!faq.active ? '<div class="faq-status inactive">Inactive</div>' : ''}
      `;
      container.appendChild(faqElement);
    });
  }
  
  formatText(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }
  
  openFAQModal(faq = null) {
    const modal = document.getElementById('faq-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('faq-form');
    
    if (faq) {
      title.textContent = 'Edit FAQ';
      document.getElementById('faq-category').value = faq.category;
      document.getElementById('faq-question').value = faq.question;
      document.getElementById('faq-answer').value = faq.answer;
      document.getElementById('faq-keywords').value = faq.keywords || '';
      form.dataset.faqId = faq.id;
    } else {
      title.textContent = 'Add New FAQ';
      form.reset();
      delete form.dataset.faqId;
    }
    
    modal.classList.add('active');
  }
  
  closeFAQModal() {
    document.getElementById('faq-modal').classList.remove('active');
  }
  
  async saveFAQ() {
    const form = document.getElementById('faq-form');
    const faqData = {
      category: document.getElementById('faq-category').value,
      question: document.getElementById('faq-question').value,
      answer: document.getElementById('faq-answer').value,
      keywords: document.getElementById('faq-keywords').value
    };
    
    try {
      const isEdit = form.dataset.faqId;
      const url = isEdit ? 
        `${this.apiBase}/faqs/${form.dataset.faqId}` : 
        `${this.apiBase}/faqs`;
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(faqData)
      });
      
      if (response.ok) {
        this.showNotification(`FAQ ${isEdit ? 'updated' : 'added'} successfully`, 'success');
        this.closeFAQModal();
        this.loadFAQs();
      } else {
        throw new Error('Failed to save FAQ');
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
      this.showNotification('Error saving FAQ', 'error');
    }
  }
  
  editFAQ(id) {
    const faq = this.faqs.find(f => f.id === id);
    if (faq) {
      this.openFAQModal(faq);
    }
  }

  async toggleFAQ(id) {
    const faq = this.faqs.find(f => f.id === id);
    if (!faq) return;

    try {
      const response = await fetch(`${this.apiBase}/faqs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...faq,
          active: !faq.active
        })
      });

      if (response.ok) {
        this.showNotification(`FAQ ${faq.active ? 'deactivated' : 'activated'} successfully`, 'success');
        this.loadFAQs();
      } else {
        throw new Error('Failed to toggle FAQ');
      }
    } catch (error) {
      console.error('Error toggling FAQ:', error);
      this.showNotification('Error updating FAQ status', 'error');
    }
  }
  
  async deleteFAQ(id) {
    if (!confirm('Are you sure you want to delete this FAQ?')) {
      return;
    }
    
    try {
      const response = await fetch(`${this.apiBase}/faqs/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        this.showNotification('FAQ deleted successfully', 'success');
        this.loadFAQs();
      } else {
        throw new Error('Failed to delete FAQ');
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      this.showNotification('Error deleting FAQ', 'error');
    }
  }
  
  async loadConversations() {
    try {
      const response = await fetch(`${this.apiBase}/conversations?limit=100`);
      this.conversations = await response.json();
      this.renderConversations();
    } catch (error) {
      console.error('Error loading conversations:', error);
      this.showNotification('Error loading conversations', 'error');
    }
  }
  
  renderConversations() {
    const container = document.getElementById('conversations-list');
    container.innerHTML = '';
    
    if (this.conversations.length === 0) {
      container.innerHTML = '<p class="no-data">No conversations found.</p>';
      return;
    }
    
    // Group conversations by session
    const sessions = {};
    this.conversations.forEach(conv => {
      if (!sessions[conv.session_id]) {
        sessions[conv.session_id] = [];
      }
      sessions[conv.session_id].push(conv);
    });
    
    Object.entries(sessions).forEach(([sessionId, messages]) => {
      const sessionElement = document.createElement('div');
      sessionElement.className = 'conversation-session';
      
      const firstMessage = messages[messages.length - 1]; // Oldest message
      const platform = firstMessage.platform || 'web';
      const contactName = firstMessage.contact_name || 'Anonymous User';
      
      const sessionHeader = document.createElement('div');
      sessionHeader.className = 'session-header';
      sessionHeader.innerHTML = `
        <div>
          <h3>${contactName} (${platform})</h3>
          <span class="session-id">Session: ${sessionId.substring(0, 12)}...</span>
        </div>
        <span class="session-date">${new Date(firstMessage.timestamp).toLocaleString()}</span>
      `;
      
      const messagesContainer = document.createElement('div');
      messagesContainer.className = 'session-messages';
      
      messages.reverse().forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.sender}`;
        messageElement.innerHTML = `
          <div class="message-content">${this.formatText(message.message)}</div>
          <div class="message-time">${new Date(message.timestamp).toLocaleTimeString()}</div>
        `;
        messagesContainer.appendChild(messageElement);
      });
      
      sessionElement.appendChild(sessionHeader);
      sessionElement.appendChild(messagesContainer);
      container.appendChild(sessionElement);
    });
  }
  
  filterConversations(searchTerm) {
    const sessions = document.querySelectorAll('.conversation-session');
    sessions.forEach(session => {
      const text = session.textContent.toLowerCase();
      const matches = text.includes(searchTerm.toLowerCase());
      session.style.display = matches ? 'block' : 'none';
    });
  }
  
  async loadAnalytics(period = 7) {
    try {
      const response = await fetch(`${this.apiBase}/analytics?period=${period}`);
      this.analytics = await response.json();
      this.renderAnalytics();
    } catch (error) {
      console.error('Error loading analytics:', error);
      this.showNotification('Error loading analytics', 'error');
    }
  }
  
  renderAnalytics() {
    // Update analytics display with real data
    const resolutionRate = this.analytics.escalationRate?.[0]?.rate || 0;
    const avgResponseTime = this.analytics.avgResponseTime?.[0]?.avg || 0;
    const satisfaction = this.analytics.avgSatisfaction?.[0]?.avg || 0;
    
    document.getElementById('resolution-rate').textContent = `${Math.round(100 - resolutionRate)}%`;
    document.getElementById('response-time').textContent = avgResponseTime > 0 ? `${(avgResponseTime/1000).toFixed(1)}s` : '1.2s';
    document.getElementById('satisfaction-score').textContent = satisfaction.toFixed(1);
  }

  async loadBroadcasts() {
    try {
      const response = await fetch(`${this.apiBase}/broadcasts`);
      const broadcasts = await response.json();
      this.renderBroadcasts(broadcasts);
    } catch (error) {
      console.error('Error loading broadcasts:', error);
      this.showNotification('Error loading broadcasts', 'error');
    }
  }

  renderBroadcasts(broadcasts) {
    const container = document.getElementById('broadcasts-list');
    if (!container) return;

    container.innerHTML = '';
    
    if (broadcasts.length === 0) {
      container.innerHTML = '<p class="no-data">No broadcasts found.</p>';
      return;
    }

    broadcasts.forEach(broadcast => {
      const broadcastElement = document.createElement('div');
      broadcastElement.className = 'broadcast-item';
      broadcastElement.innerHTML = `
        <div class="broadcast-header">
          <h3>${broadcast.title}</h3>
          <span class="broadcast-status ${broadcast.status}">${broadcast.status}</span>
        </div>
        <div class="broadcast-message">${broadcast.message}</div>
        <div class="broadcast-stats">
          <span>Sent: ${broadcast.sent_count}</span>
          <span>Failed: ${broadcast.failed_count}</span>
          <span>Created: ${new Date(broadcast.created_at).toLocaleString()}</span>
        </div>
      `;
      container.appendChild(broadcastElement);
    });
  }
  
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Initialize admin dashboard
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
  adminDashboard = new AdminDashboard();
});

// Make adminDashboard globally accessible for onclick handlers
window.adminDashboard = adminDashboard;