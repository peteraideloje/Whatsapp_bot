# 📚 API Reference

## Authentication

All admin API endpoints require JWT authentication.

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@businessbot.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@businessbot.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "admin123",
  "newPassword": "newpassword123"
}
```

## WhatsApp Webhook

### Webhook Verification
```http
GET /api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=<token>&hub.challenge=<challenge>
```

### Receive Messages
```http
POST /api/whatsapp/webhook
Content-Type: application/json

{
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "id": "message_id",
          "from": "1234567890",
          "timestamp": "1640995200",
          "text": {
            "body": "Hello"
          },
          "type": "text"
        }],
        "contacts": [{
          "profile": {
            "name": "John Doe"
          },
          "wa_id": "1234567890"
        }]
      }
    }]
  }]
}
```

### Send Broadcast
```http
POST /api/whatsapp/broadcast
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipients": ["+1234567890", "+0987654321"],
  "message": "Hello from BusinessBot!",
  "messageType": "text"
}
```

## FAQ Management

### Get FAQs
```http
GET /api/faqs?category=pricing&active=true
```

**Query Parameters:**
- `category` (optional): Filter by category
- `active` (optional): Filter by active status (true/false/all)

**Response:**
```json
[
  {
    "id": 1,
    "category": "pricing",
    "question": "What are your pricing plans?",
    "answer": "We offer three plans...",
    "keywords": "price,cost,plan",
    "active": 1,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
]
```

### Create FAQ
```http
POST /api/faqs
Authorization: Bearer <token>
Content-Type: application/json

{
  "category": "support",
  "question": "How do I reset my password?",
  "answer": "To reset your password, click on...",
  "keywords": "password,reset,forgot"
}
```

### Update FAQ
```http
PUT /api/faqs/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "category": "support",
  "question": "How do I reset my password?",
  "answer": "Updated answer...",
  "keywords": "password,reset,forgot",
  "active": true
}
```

### Delete FAQ
```http
DELETE /api/faqs/1
Authorization: Bearer <token>
```

## Conversations

### Get Conversations
```http
GET /api/conversations?sessionId=session_123&limit=50&platform=whatsapp
```

**Query Parameters:**
- `sessionId` (optional): Filter by session ID
- `limit` (optional): Number of results (default: 50)
- `platform` (optional): Filter by platform (whatsapp/web)

**Response:**
```json
[
  {
    "id": "conv_123",
    "user_id": "1234567890",
    "message": "Hello",
    "sender": "user",
    "timestamp": "2024-01-15T10:00:00Z",
    "session_id": "session_123",
    "message_id": "msg_456",
    "contact_name": "John Doe",
    "platform": "whatsapp"
  }
]
```

### Save Conversation
```http
POST /api/conversations
Content-Type: application/json

{
  "message": "Hello, how can I help?",
  "sender": "bot",
  "sessionId": "session_123",
  "userId": "1234567890",
  "platform": "whatsapp"
}
```

## Analytics

### Get Analytics
```http
GET /api/analytics?period=7
```

**Query Parameters:**
- `period` (optional): Number of days (default: 7)

**Response:**
```json
{
  "totalConversations": [{"count": 150}],
  "totalMessages": [{"count": 450}],
  "escalationRate": [{"rate": 15.5}],
  "avgSatisfaction": [{"avg": 4.2}],
  "topCategories": [
    {"category": "pricing", "count": 25},
    {"category": "support", "count": 18}
  ],
  "recentActivity": [
    {"date": "2024-01-15", "messages": 45},
    {"date": "2024-01-14", "messages": 38}
  ],
  "intentDistribution": [
    {"intent": "pricing", "count": 30},
    {"intent": "support", "count": 25}
  ],
  "avgResponseTime": [{"avg": 1200}]
}
```

### Save Analytics Event
```http
POST /api/analytics
Content-Type: application/json

{
  "sessionId": "session_123",
  "userQuery": "What are your prices?",
  "botResponse": "Here are our pricing plans...",
  "escalated": false,
  "satisfactionScore": 5,
  "intent": "pricing",
  "responseTime": 1500
}
```

## Broadcasts

### Get Broadcasts
```http
GET /api/broadcasts
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "New Product Launch",
    "message": "We're excited to announce...",
    "recipients": "['+1234567890', '+0987654321']",
    "sent_count": 2,
    "failed_count": 0,
    "status": "sent",
    "created_at": "2024-01-15T10:00:00Z",
    "sent_at": "2024-01-15T10:05:00Z"
  }
]
```

### Create Broadcast
```http
POST /api/broadcasts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Weekly Newsletter",
  "message": "This week's updates...",
  "recipients": ["+1234567890", "+0987654321"]
}
```

## Health Check

### System Health
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:00:00Z",
  "version": "2.0.0",
  "features": {
    "whatsappAPI": true,
    "openAI": true,
    "email": true,
    "auth": true,
    "analytics": true
  }
}
```

## Error Responses

All API endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional details if available"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

### Rate Limiting

API endpoints are rate limited:
- General API: 100 requests per 15 minutes per IP
- Webhook: 100 requests per second per IP

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhook Signatures (Production)

For production, verify webhook signatures:

```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

## SDKs and Libraries

### JavaScript/Node.js
```javascript
import axios from 'axios';

class BusinessBotAPI {
  constructor(baseURL, token) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getFAQs(category) {
    const response = await this.client.get('/api/faqs', {
      params: { category }
    });
    return response.data;
  }

  async createFAQ(faq) {
    const response = await this.client.post('/api/faqs', faq);
    return response.data;
  }
}
```

### Python
```python
import requests

class BusinessBotAPI:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def get_faqs(self, category=None):
        params = {'category': category} if category else {}
        response = requests.get(
            f'{self.base_url}/api/faqs',
            headers=self.headers,
            params=params
        )
        return response.json()
```

### cURL Examples

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@businessbot.com","password":"admin123"}'

# Get FAQs
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/faqs

# Create FAQ
curl -X POST http://localhost:3001/api/faqs \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"category":"test","question":"Test?","answer":"Test answer"}'
```