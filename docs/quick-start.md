# 🚀 Quick Start Guide

## Step 1: Get WhatsApp Business API Credentials

### Go to Meta for Developers
1. Visit: https://developers.facebook.com/
2. Click "Get Started" → "My Apps" → "Create App"
3. Select "Business" type
4. Add WhatsApp product to your app

### Copy These 4 Credentials:
```
Phone Number ID: Found in WhatsApp > Getting Started
Access Token: Temporary token (starts with EAA...)
Verify Token: Create your own (e.g., "my_verify_token_123")
Business Account ID: Found in WhatsApp > Getting Started
```

## Step 2: Configure Environment

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Update .env with your credentials:**
   ```env
   WHATSAPP_PHONE_NUMBER_ID=123456789012345
   WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxx
   WHATSAPP_WEBHOOK_VERIFY_TOKEN=my_verify_token_123
   WHATSAPP_BUSINESS_ACCOUNT_ID=987654321098765
   ```

## Step 3: Validate Your Setup

```bash
# Install dependencies
npm install

# Validate your configuration
npm run validate-config
```

## Step 4: Set Up Local Webhook

```bash
# Install ngrok globally
npm install -g ngrok

# Start your server
npm start

# In a new terminal, expose your server
ngrok http 3001
```

Copy the HTTPS URL from ngrok (e.g., `https://abc123.ngrok.io`)

## Step 5: Configure Webhook in Meta

1. Go to WhatsApp > Configuration in your Meta app
2. Set Webhook URL: `https://abc123.ngrok.io/api/whatsapp/webhook`
3. Set Verify Token: Use the same token from your .env
4. Click "Verify and Save"
5. Subscribe to "messages" field

## Step 6: Test Your Bot

```bash
# Send a test message
npm run setup-whatsapp test-message +1234567890
```

Or send a WhatsApp message to your test number from your phone!

## 🎉 You're Ready!

Your bot will now:
- ✅ Receive WhatsApp messages
- ✅ Respond with AI-powered answers
- ✅ Handle FAQs automatically
- ✅ Escalate complex queries to humans
- ✅ Track analytics and performance

## 🔧 Admin Dashboard

Access your admin panel at: http://localhost:5173/admin-login.html

**Default credentials:**
- Email: admin@businessbot.com
- Password: admin123

## 📞 Need Help?

Run the setup validator anytime:
```bash
npm run validate-config
```

Check the full setup guide: `docs/whatsapp-setup.md`