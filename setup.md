# WhatsApp Business Bot Setup Guide

## 🚀 Quick Start

### 1. Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Fill in your API credentials in `.env`:
   - **WhatsApp Business API**: Get from Meta Business
   - **OpenAI API Key**: Get from OpenAI platform
   - **Email SMTP**: Configure your email provider
   - **JWT Secret**: Generate a secure random string

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development

```bash
# Start both frontend and backend
npm start

# Or start separately
npm run server  # Backend only
npm run dev     # Frontend only
```

### 4. Access the Application

- **Main Site**: http://localhost:5173
- **Chat Interface**: http://localhost:5173/chat.html
- **Admin Dashboard**: http://localhost:5173/admin.html
- **Admin Login**: http://localhost:5173/admin-login.html

## 🔧 Configuration

### WhatsApp Business API Setup

1. **Create Meta Business Account**
   - Go to [Meta for Developers](https://developers.facebook.com/)
   - Create a new app with WhatsApp Business API

2. **Get Credentials**
   - Phone Number ID
   - Access Token
   - Webhook Verify Token
   - Business Account ID

3. **Configure Webhook**
   - URL: `https://yourdomain.com/api/whatsapp/webhook`
   - Verify Token: Use the one from your `.env`
   - Subscribe to: `messages`

### OpenAI Setup

1. Get API key from [OpenAI Platform](https://platform.openai.com/)
2. Add to `.env` as `OPENAI_API_KEY`

### Email Configuration

For Gmail:
1. Enable 2-factor authentication
2. Generate an app password
3. Use app password in `SMTP_PASS`

## 📊 Admin Dashboard

### Default Credentials
- **Email**: admin@businessbot.com
- **Password**: admin123

⚠️ **Change these in production!**

### Features
- Dashboard with analytics
- FAQ management
- Conversation history
- Broadcast messaging
- Settings and configuration

## 🚀 Production Deployment

### Option 1: Docker

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Option 2: PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

### Option 3: Manual

```bash
# Build the application
npm run build

# Start in production mode
NODE_ENV=production npm run server
```

## 🔒 Security Checklist

### Before Going Live:

1. **Change Default Credentials**
   - Update admin password
   - Use strong JWT secret

2. **Environment Variables**
   - Never commit `.env` to version control
   - Use secure, unique values for production

3. **HTTPS Setup**
   - WhatsApp requires HTTPS for webhooks
   - Use Let's Encrypt or your SSL provider

4. **Database Security**
   - Regular backups
   - Secure file permissions

5. **Rate Limiting**
   - Configure appropriate limits
   - Monitor for abuse

## 📈 Monitoring

### Health Check
- Endpoint: `/api/health`
- Returns system status and feature availability

### Logs
- Application logs in `./logs/`
- Database stored in `./bot_data.db`

### Analytics
- Built-in dashboard analytics
- Conversation tracking
- Performance metrics

## 🛠 Troubleshooting

### Common Issues

1. **WhatsApp Webhook Not Working**
   - Check HTTPS configuration
   - Verify webhook URL and token
   - Check firewall settings

2. **Database Errors**
   - Ensure write permissions
   - Check disk space
   - Verify SQLite installation

3. **Email Not Sending**
   - Verify SMTP credentials
   - Check firewall/port blocking
   - Test with email provider

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run server
```

## 📚 API Documentation

### Webhook Endpoints
- `GET /api/whatsapp/webhook` - Webhook verification
- `POST /api/whatsapp/webhook` - Receive messages

### Admin API
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user
- `GET /api/faqs` - Get FAQs
- `POST /api/faqs` - Create FAQ
- `PUT /api/faqs/:id` - Update FAQ
- `DELETE /api/faqs/:id` - Delete FAQ

### Analytics API
- `GET /api/analytics` - Get analytics data
- `POST /api/analytics` - Save analytics event

## 🔄 Updates

### Updating the Bot

1. Pull latest changes
2. Install new dependencies: `npm install`
3. Restart the application
4. Check health endpoint

### Database Migrations

The application automatically creates and updates database tables on startup.

## 📞 Support

For issues and questions:
1. Check this documentation
2. Review logs in `./logs/`
3. Check the health endpoint
4. Contact your development team

---

**Remember**: Always test in a development environment before deploying to production!