import './style.css'

document.querySelector('#app').innerHTML = `
  <div class="container">
    <!-- Header -->
    <header class="header">
      <div class="nav">
        <div class="logo">
          <svg class="whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.386"/>
          </svg>
          <span>BusinessBot</span>
        </div>
        <nav class="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#benefits">Benefits</a>
        </nav>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          Automate Your Customer Support with 
          <span class="gradient-text">WhatsApp Business Bot</span>
        </h1>
        <p class="hero-description">
          Enhance client communication, reduce support workload, and provide instant 24/7 assistance. 
          Our intelligent bot handles FAQs, provides information, and seamlessly connects customers to human support when needed.
        </p>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-number">80%</span>
            <span class="stat-label">Queries Resolved Automatically</span>
          </div>
          <div class="stat">
            <span class="stat-number">2s</span>
            <span class="stat-label">Average Response Time</span>
          </div>
          <div class="stat">
            <span class="stat-number">24/7</span>
            <span class="stat-label">Always Available</span>
          </div>
        </div>
        <div class="hero-actions">
          <button class="btn-primary" id="try-bot-btn">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            Try the Bot Now
          </button>
          <button class="btn-secondary" id="demo-btn">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Watch Demo
          </button>
        </div>
      </div>
      <div class="hero-visual">
        <div class="phone-mockup">
          <div class="phone-screen">
            <div class="chat-preview">
              <div class="chat-header">
                <div class="chat-avatar"></div>
                <div class="chat-info">
                  <div class="chat-name">BusinessBot</div>
                  <div class="chat-status">Online</div>
                </div>
              </div>
              <div class="chat-messages">
                <div class="message bot-message">
                  <div class="message-bubble">
                    Hi! How can I help you today? 👋
                  </div>
                </div>
                <div class="message user-message">
                  <div class="message-bubble">
                    What are your pricing plans?
                  </div>
                </div>
                <div class="message bot-message">
                  <div class="message-bubble">
                    I'd be happy to help with pricing information! Here are our current plans...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features">
      <div class="section-header">
        <h2>Powerful Features for Better Customer Engagement</h2>
        <p>Everything you need to automate and enhance your customer support experience</p>
      </div>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h3>Instant FAQ Responses</h3>
          <p>Automatically answer common questions with pre-configured responses, reducing wait times for customers.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
          </div>
          <h3>Smart Escalation</h3>
          <p>Seamlessly transfer complex queries to human agents when the bot can't provide adequate assistance.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h3>24/7 Availability</h3>
          <p>Provide round-the-clock support to your customers, even outside business hours.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          </div>
          <h3>Analytics Dashboard</h3>
          <p>Track bot performance, customer satisfaction, and identify areas for improvement.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
          </div>
          <h3>Secure & Compliant</h3>
          <p>End-to-end encryption and GDPR compliance ensure your customer data stays protected.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </div>
          <h3>Easy Integration</h3>
          <p>Connect with your existing CRM, helpdesk, and business tools for seamless workflow.</p>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="how-it-works" class="how-it-works">
      <div class="section-header">
        <h2>How It Works</h2>
        <p>Simple setup, powerful results in just a few steps</p>
      </div>
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>Customer Initiates Chat</h3>
            <p>Customer sends a message to your WhatsApp Business number</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>Bot Provides Instant Response</h3>
            <p>AI-powered bot analyzes the query and provides relevant information or options</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>Smart Escalation</h3>
            <p>Complex queries are seamlessly transferred to human agents when needed</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section id="benefits" class="benefits">
      <div class="section-header">
        <h2>Why Choose Our WhatsApp Business Bot?</h2>
      </div>
      <div class="benefits-grid">
        <div class="benefit">
          <h3>Reduce Support Costs</h3>
          <p>Handle 80% of common queries automatically, reducing the workload on your support team</p>
        </div>
        <div class="benefit">
          <h3>Improve Response Times</h3>
          <p>Instant responses mean happier customers and better satisfaction scores</p>
        </div>
        <div class="benefit">
          <h3>Scale Your Support</h3>
          <p>Handle thousands of simultaneous conversations without adding staff</p>
        </div>
        <div class="benefit">
          <h3>Never Miss a Customer</h3>
          <p>24/7 availability ensures you're always there when customers need help</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="cta-content">
        <h2>Ready to Transform Your Customer Support?</h2>
        <p>Join hundreds of businesses already using our WhatsApp Business Bot to enhance customer engagement</p>
        <button class="btn-primary" id="get-started-btn">
          Get Started Today
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <div class="logo">
            <svg class="whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.386"/>
            </svg>
            <span>BusinessBot</span>
          </div>
          <p>Automated WhatsApp Business Bot for enhanced customer engagement</p>
        </div>
        <div class="footer-section">
          <h4>Product</h4>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#benefits">Benefits</a>
        </div>
        <div class="footer-section">
          <h4>Support</h4>
          <a href="#">Documentation</a>
          <a href="#">Help Center</a>
          <a href="#">Contact Us</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 BusinessBot. All rights reserved.</p>
      </div>
    </footer>
  </div>
`

// Add event listeners for buttons
document.addEventListener('DOMContentLoaded', function() {
  const tryBotBtn = document.getElementById('try-bot-btn');
  const demoBtn = document.getElementById('demo-btn');
  const getStartedBtn = document.getElementById('get-started-btn');

  tryBotBtn.addEventListener('click', function() {
    // Navigate to chat interface
    window.location.href = '/chat.html';
  });

  demoBtn.addEventListener('click', function() {
    alert('Demo video coming soon!');
  });

  getStartedBtn.addEventListener('click', function() {
    // Navigate to chat interface
    window.location.href = '/chat.html';
  });

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});