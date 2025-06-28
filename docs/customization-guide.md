# 🎨 Customization & Update Guide

## 🔧 How to Edit and Update Your Bot

### 1. **Configure Your WhatsApp Credentials**

#### Step 1: Get WhatsApp Business API Credentials
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app → Select "Business" type
3. Add WhatsApp product to your app
4. Copy these 4 credentials:
   - **Phone Number ID** (from WhatsApp > Getting Started)
   - **Access Token** (temporary token starting with EAA...)
   - **Business Account ID** (from WhatsApp > Getting Started)
   - **Webhook Verify Token** (create your own, e.g., "my_secure_token_123")

#### Step 2: Update Environment Variables
```bash
# Edit your .env file
nano .env

# Or use the setup wizard
npm run setup-wizard
```

Update these values in `.env`:
```env
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxx
WHATSAPP_WEBHOOK_VERIFY_TOKEN=my_secure_token_123
WHATSAPP_BUSINESS_ACCOUNT_ID=987654321098765
```

### 2. **Customize Bot Responses**

#### Edit FAQ Database
```bash
# Start your server
npm start

# Access admin dashboard
# http://localhost:5173/admin-login.html
# Email: admin@businessbot.com
# Password: admin123
```

**Add/Edit FAQs:**
1. Go to "FAQs" tab in admin dashboard
2. Click "Add New FAQ"
3. Fill in:
   - **Category**: pricing, support, products, etc.
   - **Question**: Customer's question
   - **Answer**: Bot's response (supports **bold** and *italic*)
   - **Keywords**: Trigger words (comma-separated)

#### Edit Bot Personality (Code)
Edit `chat.js` to customize responses:
```javascript
// File: chat.js
const botResponses = {
  greeting: [
    "Hello! Welcome to [YOUR COMPANY NAME]! How can I help you today?",
    "Hi there! I'm [BOT NAME], your virtual assistant. What can I do for you?",
  ],
  
  pricing: {
    text: "💰 **Our Pricing Plans:**\n\n🟢 **Starter** - $[PRICE]/month\n• [FEATURE 1]\n• [FEATURE 2]\n\n🔵 **Pro** - $[PRICE]/month\n• [FEATURE 1]\n• [FEATURE 2]",
  }
};
```

### 3. **Customize Admin Dashboard**

#### Change Admin Credentials
```bash
# Access admin dashboard
# Go to Settings > Change Password
# Or edit directly in database:

sqlite3 bot_data.db
UPDATE users SET email='your-email@company.com' WHERE id=1;
UPDATE users SET name='Your Name' WHERE id=1;
```

#### Customize Dashboard Branding
Edit `admin.html` and `admin.css`:
```html
<!-- File: admin.html -->
<div class="admin-logo">
  <span>Your Company Admin</span> <!-- Change this -->
</div>
```

```css
/* File: admin.css */
:root {
  --primary: #YOUR_BRAND_COLOR; /* Change brand color */
}
```

### 4. **Configure Email Notifications**

#### Gmail Setup (Recommended)
```env
# In .env file
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Not regular password!
ADMIN_EMAIL=admin@yourcompany.com
```

**Gmail App Password Setup:**
1. Enable 2-factor authentication on Gmail
2. Go to Google Account Settings
3. Security > App passwords
4. Generate app password for "Mail"
5. Use this password in `SMTP_PASS`

#### Other Email Providers
```env
# Outlook/Hotmail
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587

# Yahoo
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587

# Custom SMTP
SMTP_HOST=mail.yourcompany.com
SMTP_PORT=587
```

### 5. **Enable AI Responses (OpenAI)**

#### Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create account and get API key
3. Add to `.env`:
```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxx
```

#### Customize AI Behavior
Edit `server/config/openai.js`:
```javascript
const systemPrompt = `You are a helpful assistant for [YOUR COMPANY NAME]. 
Your role is to:
1. Answer questions about [YOUR PRODUCTS/SERVICES]
2. Be friendly and professional
3. Keep responses under 200 words
4. If you can't help, suggest contacting human support

Company info: [ADD YOUR COMPANY DETAILS]`;
```

### 6. **Customize Website/Landing Page**

#### Edit Main Website
File: `main.js` - Update content:
```javascript
// Change company name, description, features
<h1 class="hero-title">
  Automate Your Customer Support with 
  <span class="gradient-text">[Your Company] Bot</span>
</h1>

<p class="hero-description">
  [Your custom description here]
</p>
```

#### Update Styling
File: `style.css` - Change colors and branding:
```css
:root {
  --primary: #YOUR_BRAND_COLOR;
  --secondary: #YOUR_SECONDARY_COLOR;
}
```

#### Add Your Logo
Replace the WhatsApp icon with your logo:
```html
<!-- Replace this in main.js and other files -->
<img src="/your-logo.png" alt="Your Company" class="logo-icon">
```

### 7. **Set Up Webhook (Required for WhatsApp)**

#### Local Development (ngrok)
```bash
# Install ngrok
npm install -g ngrok

# Start your server
npm start

# In new terminal, expose server
ngrok http 3001

# Copy HTTPS URL (e.g., https://abc123.ngrok.io)
```

#### Configure in Meta Developer Console
1. Go to WhatsApp > Configuration
2. Set Webhook URL: `https://abc123.ngrok.io/api/whatsapp/webhook`
3. Set Verify Token: Use same token from your `.env`
4. Click "Verify and Save"
5. Subscribe to "messages" field

### 8. **Database Customization**

#### Add Custom Fields
Edit `server/index.js` to add custom database fields:
```javascript
// Add custom conversation fields
db.run(`CREATE TABLE IF NOT EXISTS custom_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  customer_type TEXT,
  priority_level INTEGER,
  custom_field TEXT
)`);
```

#### Backup Database
```bash
# Create backup
npm run backup-db

# Or manual backup
cp bot_data.db backups/bot_data_$(date +%Y%m%d).db
```

### 9. **Advanced Customization**

#### Custom Conversation Flows
Edit `chat.js` to add complex flows:
```javascript
// Add multi-step conversations
const conversationFlows = {
  'book-appointment': {
    steps: [
      { question: "What service do you need?", field: "service" },
      { question: "Preferred date?", field: "date" },
      { question: "Your contact number?", field: "phone" }
    ]
  }
};
```

#### Custom Integrations
Add integrations in `server/routes/`:
```javascript
// Example: CRM integration
app.post('/api/integrations/crm', async (req, res) => {
  // Send customer data to your CRM
  await sendToCRM(req.body);
});
```

### 10. **Testing Your Changes**

#### Validate Configuration
```bash
npm run validate-config
```

#### Test Bot Responses
```bash
# Send test message
npm run setup-whatsapp test-message +1234567890
```

#### Health Check
```bash
npm run health-check
```

### 11. **Deploy Your Customized Bot**

#### Option 1: Railway (Easiest)
```bash
npm run deploy railway
```

#### Option 2: Heroku
```bash
npm run deploy heroku
```

#### Option 3: Your Own Server
```bash
# Build for production
npm run build

# Start with PM2
npm run pm2:start
```

### 12. **Ongoing Updates**

#### Update Bot Responses
1. Access admin dashboard
2. Go to FAQs section
3. Add/edit/delete responses
4. Changes take effect immediately

#### Update Code
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Restart server
npm run pm2:restart
```

#### Monitor Performance
```bash
# Check health
npm run health-check

# Monitor continuously
npm run health-monitor

# View logs
tail -f logs/combined.log
```

## 🎯 Quick Customization Checklist

- [ ] Update WhatsApp credentials in `.env`
- [ ] Change admin password
- [ ] Add your company FAQs
- [ ] Configure email notifications
- [ ] Set up OpenAI (optional)
- [ ] Customize branding/colors
- [ ] Set up webhook with ngrok
- [ ] Test bot responses
- [ ] Deploy to production
- [ ] Update webhook URL for production

## 🆘 Need Help?

1. **Run diagnostics**: `npm run health-check`
2. **Check logs**: `tail -f logs/combined.log`
3. **Validate setup**: `npm run validate-config`
4. **Review docs**: Check `docs/` folder

## 📞 Support Commands

```bash
# Get help with any script
npm run setup-wizard     # Interactive setup
npm run validate-config  # Check configuration
npm run health-check     # System diagnostics
npm run deploy --help    # Deployment options
```

Your bot is now ready to be customized and deployed! 🚀