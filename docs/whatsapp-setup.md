# WhatsApp Business API Setup Guide

## 🚀 Complete Setup Process

### Step 1: Create Meta Business Account

1. **Go to Meta for Developers**
   - Visit: https://developers.facebook.com/
   - Click "Get Started" or "My Apps"

2. **Create a New App**
   - Click "Create App"
   - Select "Business" as the app type
   - Fill in your app details:
     - App Name: "YourCompany WhatsApp Bot"
     - Contact Email: your-email@company.com
     - Business Account: Create or select existing

3. **Add WhatsApp Product**
   - In your app dashboard, click "Add Product"
   - Find "WhatsApp" and click "Set Up"

### Step 2: Get Your Credentials

#### Phone Number ID
1. In WhatsApp > Getting Started
2. Copy the "Phone number ID" (starts with numbers like 123456789012345)

#### Access Token
1. In WhatsApp > Getting Started
2. Copy the "Temporary access token" (starts with EAAxxxxx)
3. **Important**: This is temporary! You'll need to generate a permanent one later

#### Webhook Verify Token
1. Create a random string (e.g., "my_webhook_verify_token_123")
2. Save this - you'll use it in both Meta and your .env file

#### Business Account ID
1. In WhatsApp > Getting Started
2. Copy the "WhatsApp Business Account ID"

### Step 3: Configure Your Environment

Update your `.env` file with the credentials:

```env
# WhatsApp Business API Configuration
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_WEBHOOK_VERIFY_TOKEN=my_webhook_verify_token_123
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
```

### Step 4: Set Up Webhook (Local Development)

For local testing, you need to expose your local server to the internet:

#### Option A: Using ngrok (Recommended)
```bash
# Install ngrok
npm install -g ngrok

# In a new terminal, expose your local server
ngrok http 3001

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

#### Option B: Using Cloudflare Tunnel
```bash
# Install cloudflared
# Visit: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/

# Create tunnel
cloudflared tunnel --url http://localhost:3001
```

### Step 5: Configure Webhook in Meta

1. **Go to WhatsApp > Configuration**
2. **Set Webhook URL**:
   - URL: `https://your-ngrok-url.ngrok.io/api/whatsapp/webhook`
   - Verify Token: Use the same token from your .env file
3. **Click "Verify and Save"**
4. **Subscribe to Webhook Fields**:
   - Check "messages"
   - Click "Subscribe"

### Step 6: Test Your Setup

1. **Start your server**:
   ```bash
   npm start
   ```

2. **Check health endpoint**:
   ```bash
   curl http://localhost:3001/api/health
   ```

3. **Test webhook verification**:
   - Meta will automatically verify when you save the webhook
   - Check your server logs for verification success

### Step 7: Send Test Message

1. **In Meta Developer Console**:
   - Go to WhatsApp > Getting Started
   - Find "Send and receive messages"
   - Add your phone number as a recipient
   - Send a test message

2. **Send message from your phone**:
   - Send a WhatsApp message to the test number provided by Meta
   - Check your server logs to see if the message is received

### Step 8: Generate Permanent Access Token

The temporary token expires in 24 hours. For production:

1. **Create System User**:
   - Go to Business Settings > System Users
   - Click "Add" and create a system user
   - Assign WhatsApp permissions

2. **Generate Token**:
   - Select your system user
   - Click "Generate New Token"
   - Select your app and required permissions
   - Copy the permanent token

3. **Update .env**:
   ```env
   WHATSAPP_ACCESS_TOKEN=your_permanent_token_here
   ```

## 🔧 Production Deployment

### Step 1: Deploy Your Server

#### Option A: Using Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Option B: Using Heroku
```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set WHATSAPP_PHONE_NUMBER_ID=your_id
heroku config:set WHATSAPP_ACCESS_TOKEN=your_token
# ... set all other env vars

# Deploy
git push heroku main
```

#### Option C: Using DigitalOcean/AWS/VPS
```bash
# Use Docker deployment
docker-compose up -d

# Or PM2
pm2 start ecosystem.config.js --env production
```

### Step 2: Update Webhook URL

1. **Get your production URL** (e.g., https://your-app.railway.app)
2. **Update webhook in Meta**:
   - URL: `https://your-app.railway.app/api/whatsapp/webhook`
   - Verify and save

### Step 3: Configure Domain (Optional)

For custom domain:
1. **Set up DNS** pointing to your server
2. **Configure SSL** (Let's Encrypt recommended)
3. **Update webhook URL** to use your domain

## 🧪 Testing Your Bot

### Test Scenarios

1. **Basic FAQ Test**:
   - Send: "What are your pricing plans?"
   - Expected: Bot responds with pricing information

2. **Escalation Test**:
   - Send: "I want to speak to a human"
   - Expected: Bot escalates and sends email notification

3. **Unknown Query Test**:
   - Send: "Random question about xyz"
   - Expected: Bot provides fallback response

### Debugging Tips

1. **Check Server Logs**:
   ```bash
   # View real-time logs
   tail -f logs/combined.log
   ```

2. **Test Webhook Manually**:
   ```bash
   curl -X POST https://your-url/api/whatsapp/webhook \
     -H "Content-Type: application/json" \
     -d '{"test": "webhook"}'
   ```

3. **Verify Database**:
   ```bash
   # Check if messages are being saved
   sqlite3 bot_data.db "SELECT * FROM conversations LIMIT 5;"
   ```

## 🔒 Security Checklist

- [ ] Use HTTPS for webhook URL
- [ ] Verify webhook signatures (implement in production)
- [ ] Use permanent access tokens
- [ ] Set up rate limiting
- [ ] Configure firewall rules
- [ ] Regular token rotation
- [ ] Monitor for suspicious activity

## 📞 Support

If you encounter issues:

1. **Check Meta Developer Console** for error messages
2. **Review server logs** for detailed error information
3. **Test webhook connectivity** using online tools
4. **Verify all credentials** are correctly set

## 🎯 Next Steps

After successful setup:
1. Customize FAQ responses for your business
2. Set up email notifications
3. Configure OpenAI for smarter responses
4. Add more sophisticated conversation flows
5. Implement analytics tracking