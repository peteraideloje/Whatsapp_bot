# 🚀 Production Deployment Guide

## Choose Your Deployment Platform

### 1. 🚂 Railway (Recommended - Easiest)

**Why Railway?**
- ✅ Automatic HTTPS
- ✅ Environment variables UI
- ✅ Git-based deployment
- ✅ Free tier available
- ✅ Built-in database support

**Deploy Steps:**
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Deploy your bot
npm run deploy railway

# 4. Set environment variables in Railway dashboard
# 5. Update webhook URL in Meta console
```

**Manual Railway Setup:**
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Set environment variables in dashboard
4. Deploy automatically on git push

### 2. 🟣 Heroku

**Deploy Steps:**
```bash
# 1. Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# 2. Login to Heroku
heroku login

# 3. Deploy your bot
npm run deploy heroku

# 4. Update webhook URL
```

**Manual Heroku Setup:**
```bash
# Create app
heroku create your-bot-name

# Set environment variables
heroku config:set WHATSAPP_PHONE_NUMBER_ID=your_id
heroku config:set WHATSAPP_ACCESS_TOKEN=your_token
# ... set all other variables

# Deploy
git push heroku main
```

### 3. 🐳 Docker (Any VPS)

**For DigitalOcean, AWS, Google Cloud, etc.**

```bash
# 1. Build and deploy
npm run deploy docker

# 2. Or manual Docker setup
docker build -t whatsapp-bot .
docker run -d -p 3001:3001 --env-file .env whatsapp-bot
```

**Docker Compose (Recommended):**
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. ⚡ PM2 (VPS/Dedicated Server)

**For your own server:**
```bash
# 1. Deploy with PM2
npm run deploy pm2

# 2. Or manual PM2 setup
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 🔧 Production Configuration

### 1. Environment Variables for Production

**Required Variables:**
```env
# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=your_production_phone_id
WHATSAPP_ACCESS_TOKEN=your_permanent_token  # Not temporary!
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_secure_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_id

# Security
JWT_SECRET=very_long_random_string_for_production
NODE_ENV=production

# Server
PORT=3001

# Database (for production, consider PostgreSQL)
DATABASE_URL=./bot_data.db

# Email (Production SMTP)
SMTP_HOST=smtp.yourcompany.com
SMTP_USER=noreply@yourcompany.com
SMTP_PASS=your_production_smtp_password
ADMIN_EMAIL=admin@yourcompany.com

# OpenAI (Optional)
OPENAI_API_KEY=your_openai_key
```

### 2. Get Permanent WhatsApp Access Token

**Important:** Temporary tokens expire in 24 hours!

1. **Create System User:**
   - Go to Meta Business Settings
   - System Users → Add
   - Create system user with WhatsApp permissions

2. **Generate Permanent Token:**
   - Select your system user
   - Generate New Token
   - Select your app and WhatsApp permissions
   - Copy the permanent token

3. **Update Environment:**
   ```env
   WHATSAPP_ACCESS_TOKEN=your_permanent_token_here
   ```

### 3. SSL/HTTPS Setup

**WhatsApp requires HTTPS for webhooks!**

#### Option A: Platform-provided HTTPS
- Railway, Heroku, Vercel automatically provide HTTPS
- No additional setup needed

#### Option B: Let's Encrypt (VPS)
```bash
# Install certbot
sudo apt install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Update nginx configuration
sudo nano /etc/nginx/sites-available/default
```

#### Option C: Cloudflare
1. Add your domain to Cloudflare
2. Enable SSL/TLS encryption
3. Set SSL mode to "Full"

### 4. Domain Setup (Optional)

**Custom Domain Configuration:**

1. **Buy Domain** (GoDaddy, Namecheap, etc.)

2. **DNS Configuration:**
   ```
   Type: A
   Name: @
   Value: your_server_ip
   
   Type: CNAME
   Name: www
   Value: yourdomain.com
   ```

3. **Update Webhook URL:**
   - New URL: `https://yourdomain.com/api/whatsapp/webhook`
   - Update in Meta Developer Console

## 🔒 Production Security Checklist

### 1. Environment Security
- [ ] Use strong, unique JWT secret
- [ ] Never commit `.env` to version control
- [ ] Use permanent WhatsApp access tokens
- [ ] Enable HTTPS for all endpoints
- [ ] Set up proper CORS policies

### 2. Database Security
- [ ] Regular database backups
- [ ] Secure file permissions (600 for .db files)
- [ ] Consider PostgreSQL for high-traffic
- [ ] Implement data retention policies

### 3. Server Security
- [ ] Keep dependencies updated
- [ ] Enable rate limiting
- [ ] Set up monitoring and alerts
- [ ] Configure firewall rules
- [ ] Regular security updates

### 4. API Security
- [ ] Verify webhook signatures
- [ ] Implement request validation
- [ ] Monitor for suspicious activity
- [ ] Set up API rate limits

## 📊 Production Monitoring

### 1. Health Monitoring
```bash
# Set up continuous monitoring
npm run health-monitor

# Or create a cron job
# Add to crontab: */5 * * * * /path/to/your/app/health-check.sh
```

### 2. Log Management
```bash
# View logs
tail -f logs/combined.log

# Rotate logs (add to cron)
0 0 * * * /usr/sbin/logrotate /path/to/logrotate.conf
```

### 3. Performance Monitoring

**PM2 Monitoring:**
```bash
pm2 monit
pm2 logs
pm2 status
```

**Docker Monitoring:**
```bash
docker stats
docker logs container_name
```

### 4. Uptime Monitoring

**External Services:**
- UptimeRobot
- Pingdom
- StatusCake

**Setup:**
- Monitor: `https://yourdomain.com/api/health`
- Alert on: HTTP errors, response time > 5s

## 🔄 Deployment Automation

### 1. GitHub Actions (CI/CD)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Deploy to Railway
      run: |
        npm install -g @railway/cli
        railway login --token ${{ secrets.RAILWAY_TOKEN }}
        railway up
```

### 2. Automatic Backups

**Database Backup Script:**
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_FILE="bot_data.db"

# Create backup
cp $DB_FILE "$BACKUP_DIR/bot_data_$DATE.db"

# Keep only last 30 days
find $BACKUP_DIR -name "bot_data_*.db" -mtime +30 -delete

# Upload to cloud storage (optional)
# aws s3 cp "$BACKUP_DIR/bot_data_$DATE.db" s3://your-bucket/
```

**Add to crontab:**
```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

## 🚨 Troubleshooting Production Issues

### 1. Common Production Problems

**Webhook Not Working:**
```bash
# Check webhook URL
curl -I https://yourdomain.com/api/whatsapp/webhook

# Verify SSL certificate
openssl s_client -connect yourdomain.com:443

# Check Meta webhook logs
# Go to Meta Developer Console > WhatsApp > Webhooks
```

**Database Issues:**
```bash
# Check database permissions
ls -la bot_data.db

# Test database connection
sqlite3 bot_data.db "SELECT COUNT(*) FROM conversations;"

# Check disk space
df -h
```

**Memory Issues:**
```bash
# Check memory usage
free -h
top

# Restart application
pm2 restart whatsapp-business-bot
```

### 2. Emergency Procedures

**Quick Rollback:**
```bash
# Git rollback
git revert HEAD
git push origin main

# PM2 rollback
pm2 stop whatsapp-business-bot
git checkout previous_working_commit
npm install
pm2 start ecosystem.config.js
```

**Database Recovery:**
```bash
# Restore from backup
cp backups/bot_data_YYYYMMDD.db bot_data.db
pm2 restart whatsapp-business-bot
```

## 📈 Scaling for High Traffic

### 1. Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_conversations_timestamp ON conversations(timestamp);
CREATE INDEX idx_analytics_timestamp ON analytics(timestamp);
```

### 2. Caching Layer
```javascript
// Add Redis for caching
const redis = require('redis');
const client = redis.createClient();

// Cache FAQ responses
const cachedFAQ = await client.get(`faq:${category}`);
```

### 3. Load Balancing
```nginx
# nginx.conf
upstream app {
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}
```

### 4. Database Migration (PostgreSQL)
```bash
# For high traffic, migrate to PostgreSQL
npm install pg
# Update DATABASE_URL to PostgreSQL connection string
```

## ✅ Post-Deployment Checklist

- [ ] Webhook URL updated in Meta console
- [ ] SSL certificate working
- [ ] All environment variables set
- [ ] Database accessible and backed up
- [ ] Email notifications working
- [ ] Health check endpoint responding
- [ ] Admin dashboard accessible
- [ ] Test message flow working
- [ ] Monitoring and alerts configured
- [ ] Documentation updated with production URLs

## 🎉 You're Live!

Your WhatsApp Business Bot is now running in production! 

**Next Steps:**
1. Monitor the health dashboard
2. Test with real customers
3. Gather feedback and iterate
4. Scale as needed

**Support:**
- Monitor: `https://yourdomain.com/api/health`
- Admin: `https://yourdomain.com/admin-login.html`
- Logs: Check your deployment platform's log viewer