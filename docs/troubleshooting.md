# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### 1. WhatsApp Webhook Issues

#### Problem: Webhook verification fails
```
Error: Webhook verification failed
```

**Solutions:**
1. **Check verify token**:
   ```bash
   # Make sure tokens match
   echo $WHATSAPP_WEBHOOK_VERIFY_TOKEN
   ```

2. **Verify HTTPS URL**:
   - WhatsApp requires HTTPS
   - Use ngrok: `ngrok http 3001`
   - Copy HTTPS URL (not HTTP)

3. **Check server logs**:
   ```bash
   tail -f logs/combined.log
   ```

#### Problem: Messages not received
```
No webhook calls received
```

**Solutions:**
1. **Test webhook manually**:
   ```bash
   curl -X GET "http://localhost:3001/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test"
   ```

2. **Check ngrok status**:
   ```bash
   curl http://localhost:4040/api/tunnels
   ```

3. **Verify subscription**:
   - Go to Meta Developer Console
   - WhatsApp > Configuration
   - Ensure "messages" is subscribed

### 2. Database Issues

#### Problem: SQLite errors
```
Error: SQLITE_BUSY: database is locked
```

**Solutions:**
1. **Check file permissions**:
   ```bash
   ls -la bot_data.db
   chmod 664 bot_data.db
   ```

2. **Close existing connections**:
   ```bash
   # Restart the server
   npm run server
   ```

3. **Database corruption**:
   ```bash
   # Backup and recreate
   cp bot_data.db bot_data.db.backup
   rm bot_data.db
   npm run server  # Will recreate tables
   ```

#### Problem: Migration errors
```
Error: table already exists
```

**Solutions:**
1. **Check table structure**:
   ```bash
   sqlite3 bot_data.db ".schema"
   ```

2. **Manual migration**:
   ```sql
   -- Add missing columns
   ALTER TABLE conversations ADD COLUMN platform TEXT DEFAULT 'whatsapp';
   ```

### 3. API Connection Issues

#### Problem: WhatsApp API authentication fails
```
Error: Invalid access token
```

**Solutions:**
1. **Check token format**:
   - Should start with "EAA"
   - No extra spaces or characters

2. **Generate new token**:
   - Go to Meta Developer Console
   - WhatsApp > Getting Started
   - Generate new temporary token

3. **Verify permissions**:
   - Check app has WhatsApp permissions
   - Business account is verified

#### Problem: OpenAI API errors
```
Error: OpenAI API request failed
```

**Solutions:**
1. **Check API key**:
   ```bash
   curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
   ```

2. **Check quota**:
   - Visit OpenAI dashboard
   - Check usage limits

3. **Fallback responses**:
   - Bot will use predefined responses if OpenAI fails
   - Check FAQ database

### 4. Email Issues

#### Problem: Email notifications not sending
```
Error: SMTP authentication failed
```

**Solutions:**
1. **Gmail setup**:
   ```bash
   # Use app password, not regular password
   # Enable 2FA first
   # Generate app password in Google Account settings
   ```

2. **Test SMTP connection**:
   ```bash
   node -e "
   const nodemailer = require('nodemailer');
   const transporter = nodemailer.createTransporter({
     host: process.env.SMTP_HOST,
     port: process.env.SMTP_PORT,
     auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
   });
   transporter.verify().then(console.log).catch(console.error);
   "
   ```

3. **Check firewall**:
   - Ensure port 587 is open
   - Some networks block SMTP

### 5. Performance Issues

#### Problem: Slow response times
```
Bot responses taking too long
```

**Solutions:**
1. **Check server resources**:
   ```bash
   top
   df -h
   ```

2. **Database optimization**:
   ```sql
   -- Add indexes
   CREATE INDEX idx_conversations_session ON conversations(session_id);
   CREATE INDEX idx_conversations_timestamp ON conversations(timestamp);
   ```

3. **Enable caching**:
   ```javascript
   // Cache FAQ responses
   const faqCache = new Map();
   ```

#### Problem: Memory leaks
```
Process memory keeps growing
```

**Solutions:**
1. **Monitor with PM2**:
   ```bash
   pm2 monit
   ```

2. **Restart on memory limit**:
   ```javascript
   // In ecosystem.config.js
   max_memory_restart: '1G'
   ```

### 6. Security Issues

#### Problem: Rate limiting triggered
```
Too many requests
```

**Solutions:**
1. **Check rate limits**:
   ```bash
   # View current limits
   grep -r "rate" server/
   ```

2. **Whitelist IPs**:
   ```javascript
   // In server configuration
   skip: (req) => req.ip === 'trusted.ip.address'
   ```

#### Problem: Unauthorized access
```
JWT token invalid
```

**Solutions:**
1. **Check token expiry**:
   ```bash
   # Tokens expire after 24h
   # Re-login to admin dashboard
   ```

2. **Verify JWT secret**:
   ```bash
   echo $JWT_SECRET
   # Should be long and random
   ```

## Debugging Tools

### 1. Health Check
```bash
npm run health-check
```

### 2. Configuration Validator
```bash
npm run validate-config
```

### 3. Log Analysis
```bash
# View recent logs
tail -f logs/combined.log

# Search for errors
grep -i error logs/combined.log

# Filter by timestamp
grep "2024-01-15" logs/combined.log
```

### 4. Database Inspection
```bash
# Connect to database
sqlite3 bot_data.db

# Common queries
.tables
SELECT COUNT(*) FROM conversations;
SELECT * FROM faqs WHERE active = 1;
SELECT * FROM analytics ORDER BY timestamp DESC LIMIT 10;
```

### 5. API Testing
```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test webhook
curl -X POST http://localhost:3001/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Test admin API
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/auth/me
```

## Getting Help

### 1. Enable Debug Mode
```bash
DEBUG=* npm run server
```

### 2. Collect System Info
```bash
# System information
node --version
npm --version
sqlite3 --version

# Environment check
npm run validate-config

# Health status
npm run health-check
```

### 3. Log Collection
```bash
# Create support bundle
tar -czf support-bundle.tar.gz \
  logs/ \
  .env.example \
  package.json \
  bot_data.db
```

### 4. Common Log Patterns

**Successful message processing:**
```
[INFO] Message received from +1234567890
[INFO] FAQ match found: pricing
[INFO] Response sent successfully
```

**Escalation triggered:**
```
[INFO] Escalation triggered for session: abc123
[INFO] Email notification sent to admin
```

**API errors:**
```
[ERROR] WhatsApp API error: Invalid phone number
[ERROR] OpenAI API timeout
[WARN] Falling back to predefined response
```

## Prevention Tips

1. **Regular backups**:
   ```bash
   # Daily backup script
   cp bot_data.db "backups/bot_data_$(date +%Y%m%d).db"
   ```

2. **Monitor disk space**:
   ```bash
   df -h
   # Clean old logs if needed
   ```

3. **Update dependencies**:
   ```bash
   npm audit
   npm update
   ```

4. **Test after changes**:
   ```bash
   npm run validate-config
   npm run health-check
   ```

5. **Monitor performance**:
   ```bash
   # Use PM2 for production
   pm2 start ecosystem.config.js
   pm2 monit
   ```