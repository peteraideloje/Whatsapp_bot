# 🤖 WhatsApp Business Bot

A complete, production-ready WhatsApp Business API bot with admin dashboard, analytics, and intelligent conversation handling.

![WhatsApp Business Bot](https://img.shields.io/badge/WhatsApp-Business%20Bot-25D366?style=for-the-badge&logo=whatsapp)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## ✨ Features

- 🚀 **WhatsApp Business API Integration** - Official Meta API support
- 🤖 **AI-Powered Responses** - OpenAI integration for intelligent conversations
- 📊 **Admin Dashboard** - Complete management interface
- 📈 **Analytics & Reporting** - Detailed conversation insights
- 🔄 **Smart Escalation** - Automatic handoff to human agents
- 📧 **Email Notifications** - Real-time alerts for escalations
- 🎯 **FAQ Management** - Dynamic knowledge base
- 📱 **Multi-Platform** - WhatsApp and web chat support
- 🔒 **Secure & Scalable** - Production-ready architecture

## 🚀 Quick Start

### 1. Interactive Setup Wizard
```bash
npm install
npm run setup-wizard
```

### 2. Manual Setup
```bash
# Clone and install
git clone <repository-url>
cd whatsapp-business-bot
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Validate setup
npm run validate-config

# Start the application
npm start
```

### 3. Access Your Bot
- **Main Site**: http://localhost:5173
- **Chat Interface**: http://localhost:5173/chat.html
- **Admin Dashboard**: http://localhost:5173/admin-login.html

## 📋 Prerequisites

- **Node.js** 18+ and npm 8+
- **WhatsApp Business API** credentials from Meta
- **OpenAI API Key** (optional, for AI responses)
- **Email SMTP** credentials (optional, for notifications)

## 🔧 Configuration

### WhatsApp Business API Setup

1. **Create Meta Developer Account**
   - Visit: https://developers.facebook.com/
   - Create new app with WhatsApp Business API

2. **Get Required Credentials**:
   - Phone Number ID
   - Access Token
   - Business Account ID
   - Webhook Verify Token (create your own)

3. **Configure Webhook**:
   ```bash
   # Use ngrok for local development
   npm install -g ngrok
   ngrok http 3001
   
   # Set webhook URL in Meta console:
   # https://your-ngrok-url.ngrok.io/api/whatsapp/webhook
   ```

### Environment Variables

```env
# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id

# OpenAI (Optional)
OPENAI_API_KEY=your_openai_api_key

# Email Notifications (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
ADMIN_EMAIL=admin@yourcompany.com

# Security
JWT_SECRET=your_secure_jwt_secret

# Server
PORT=3001
NODE_ENV=development
```

## 🎯 Usage

### Admin Dashboard

Access the admin dashboard at `/admin-login.html`:

**Default Credentials:**
- Email: `admin@businessbot.com`
- Password: `admin123`

**Features:**
- 📊 Real-time analytics dashboard
- 💬 FAQ management system
- 📝 Conversation history
- 📢 Broadcast messaging
- ⚙️ System settings

### Bot Capabilities

- **Automatic FAQ Responses** - Instant answers to common questions
- **Intent Recognition** - AI-powered understanding of user queries
- **Smart Escalation** - Seamless handoff to human agents
- **Multi-language Support** - Configurable for different languages
- **Rich Media Support** - Images, documents, and interactive messages

## 🛠 Available Scripts

### Development
```bash
npm start              # Start full application (frontend + backend)
npm run dev            # Frontend development server only
npm run server         # Backend server only
npm run build          # Build for production
```

### Setup & Configuration
```bash
npm run setup-wizard       # Interactive setup wizard
npm run validate-config    # Validate WhatsApp configuration
npm run generate-env       # Generate secure .env file
npm run health-check       # System health check
npm run health-monitor     # Continuous health monitoring
```

### Deployment
```bash
npm run deploy railway     # Deploy to Railway
npm run deploy heroku      # Deploy to Heroku
npm run deploy docker      # Deploy with Docker
npm run deploy pm2         # Deploy with PM2
```

### Database & Maintenance
```bash
npm run backup-db          # Backup database
npm run restore-db         # Restore database
npm run clean-logs         # Clean log files
```

### Production Management
```bash
npm run production         # Start in production mode
npm run pm2:start         # Start with PM2
npm run pm2:stop          # Stop PM2 process
npm run pm2:restart       # Restart PM2 process
npm run pm2:logs          # View PM2 logs
```

## 🚀 Deployment

### Option 1: Railway (Recommended)
```bash
npm run deploy railway
```

### Option 2: Heroku
```bash
npm run deploy heroku
```

### Option 3: Docker
```bash
npm run deploy docker
```

### Option 4: VPS with PM2
```bash
npm run deploy pm2
```

## 📊 Monitoring & Analytics

### Health Monitoring
```bash
# One-time health check
npm run health-check

# Continuous monitoring (30s intervals)
npm run health-monitor

# Custom interval (60s)
npm run health-monitor 60
```

### Analytics Dashboard

The admin dashboard provides:
- **Conversation Metrics** - Total conversations, messages, response times
- **Escalation Rates** - Human handoff statistics
- **User Satisfaction** - Feedback and ratings
- **Intent Analysis** - Most common query types
- **Performance Trends** - Historical data and patterns

## 🔒 Security

- **JWT Authentication** - Secure admin access
- **Rate Limiting** - API protection against abuse
- **Input Validation** - SQL injection and XSS prevention
- **HTTPS Enforcement** - Secure webhook communication
- **Environment Variables** - Sensitive data protection

## 🧪 Testing

### Manual Testing
```bash
# Test webhook endpoint
npm run test-webhook

# Send test message
npm run setup-whatsapp test-message +1234567890

# Validate configuration
npm run validate-config
```

### Health Checks
```bash
# System health
curl http://localhost:3001/api/health

# Database connectivity
sqlite3 bot_data.db "SELECT COUNT(*) FROM conversations;"

# WhatsApp API
curl -H "Authorization: Bearer $WHATSAPP_ACCESS_TOKEN" \
  "https://graph.facebook.com/v18.0/$WHATSAPP_PHONE_NUMBER_ID"
```

## 📚 Documentation

- **[Setup Guide](docs/whatsapp-setup.md)** - Complete setup instructions
- **[Quick Start](docs/quick-start.md)** - Fast track setup
- **[API Reference](docs/api-reference.md)** - Complete API documentation
- **[Troubleshooting](docs/troubleshooting.md)** - Common issues and solutions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

1. **Check Documentation** - Review the docs folder
2. **Run Diagnostics** - Use `npm run health-check`
3. **Check Logs** - View `logs/combined.log`
4. **Validate Config** - Run `npm run validate-config`

### Common Issues

- **Webhook not working** - Check HTTPS URL and verify token
- **Messages not received** - Verify webhook subscription in Meta console
- **Database errors** - Check file permissions and disk space
- **API authentication** - Verify access token and permissions

### Debug Mode
```bash
DEBUG=* npm run server
```

## 🎉 What's Next?

After successful setup:

1. **Customize FAQs** - Add your business-specific questions and answers
2. **Configure Email** - Set up escalation notifications
3. **Enable AI** - Add OpenAI for smarter responses
4. **Brand Customization** - Update colors, logos, and messaging
5. **Advanced Features** - Implement custom conversation flows
6. **Analytics Setup** - Configure detailed tracking and reporting
7. **Production Deployment** - Deploy to your preferred platform
8. **Team Training** - Train your team on the admin dashboard

---

**Built with ❤️ for businesses looking to automate and enhance their WhatsApp customer support.**