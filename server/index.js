import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import whatsappRoutes from './routes/whatsapp.js';
import authRoutes from './routes/auth.js';

// Import services
import { createDefaultAdmin } from './middleware/auth.js';
import { initializeScheduledJobs } from './jobs/scheduler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS and JSON middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize SQLite database
const db = new sqlite3.Database('./bot_data.db');

// Database middleware
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Create tables
db.serialize(async () => {
  // Users table for authentication
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Enhanced conversations table
  db.run(`CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    message TEXT,
    sender TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    session_id TEXT,
    message_id TEXT,
    contact_name TEXT,
    platform TEXT DEFAULT 'whatsapp'
  )`);

  // FAQ table
  db.run(`CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    question TEXT,
    answer TEXT,
    keywords TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT 1
  )`);

  // Enhanced analytics table
  db.run(`CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    user_query TEXT,
    bot_response TEXT,
    escalated BOOLEAN DEFAULT 0,
    satisfaction_score INTEGER,
    intent TEXT,
    response_time INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Broadcast messages table
  db.run(`CREATE TABLE IF NOT EXISTS broadcasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    recipients TEXT, -- JSON array of phone numbers
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sent_at DATETIME
  )`);

  // Create default admin user
  try {
    await createDefaultAdmin(db);
  } catch (error) {
    console.error('Error creating default admin:', error);
  }

  // Insert enhanced default FAQs
  const defaultFAQs = [
    {
      category: 'pricing',
      question: 'What are your pricing plans?',
      answer: '💰 **Our Pricing Plans:**\n\n🟢 **Starter Plan** - $29/month\n• Up to 1,000 messages\n• Basic FAQ automation\n• Email support\n\n🔵 **Professional Plan** - $79/month\n• Up to 5,000 messages\n• Advanced AI responses\n• Priority support\n• Analytics dashboard\n\n🟡 **Enterprise Plan** - $199/month\n• Unlimited messages\n• Custom integrations\n• Dedicated support\n• White-label solution\n\nWould you like more details about any specific plan?',
      keywords: 'price,cost,plan,pricing,fee,subscription,payment,how much'
    },
    {
      category: 'support',
      question: 'How can I get technical support?',
      answer: '🛠️ **Technical Support Options:**\n\n• **Setup & Integration** - Help with WhatsApp Business API setup\n• **Bot Configuration** - Customize responses and workflows\n• **Troubleshooting** - Resolve technical issues\n• **API Documentation** - Access our developer resources\n\n📞 **Contact Methods:**\n• Email: support@businessbot.com\n• Phone: +1-800-BOT-HELP\n• Live Chat: Available 9 AM - 6 PM EST\n\nWhat specific technical assistance do you need?',
      keywords: 'help,support,technical,setup,problem,issue,bug,not working,error'
    },
    {
      category: 'products',
      question: 'What products and services do you offer?',
      answer: '📦 **Our Complete Product Suite:**\n\n🤖 **WhatsApp Business Bot**\n• Automated customer support\n• FAQ handling & smart responses\n• Lead qualification & routing\n• Multi-language support\n\n📊 **Analytics Dashboard**\n• Real-time conversation insights\n• Performance metrics & KPIs\n• Customer satisfaction tracking\n• Custom reporting\n\n🔗 **CRM Integration**\n• Seamless data synchronization\n• Customer history & profiles\n• Automated follow-up campaigns\n• Sales pipeline management\n\n🎯 **Additional Services**\n• Custom bot development\n• Training & onboarding\n• 24/7 monitoring & support\n\nWhich product interests you most?',
      keywords: 'product,feature,service,what do you offer,capabilities,solutions'
    },
    {
      category: 'general',
      question: 'What is BusinessBot and how does it work?',
      answer: '🤖 **About BusinessBot:**\n\nBusinessBot is an intelligent WhatsApp automation platform that helps businesses provide instant, 24/7 customer support.\n\n**How it works:**\n1️⃣ Customers message your WhatsApp Business number\n2️⃣ Our AI analyzes their query and provides instant responses\n3️⃣ Complex issues are seamlessly escalated to human agents\n4️⃣ All interactions are tracked and analyzed for insights\n\n**Key Benefits:**\n✅ Reduce response time from hours to seconds\n✅ Handle multiple conversations simultaneously\n✅ Improve customer satisfaction scores\n✅ Reduce support team workload by 80%\n\nWould you like to see a demo or learn about our pricing?',
      keywords: 'what is,how does it work,about,businessbot,demo,overview'
    },
    {
      category: 'contact',
      question: 'How can I contact your team?',
      answer: '👥 **Get in Touch with Our Team:**\n\n📧 **Email Support:**\n• General: info@businessbot.com\n• Technical: support@businessbot.com\n• Sales: sales@businessbot.com\n\n📞 **Phone Support:**\n• Main: +1-800-BOT-HELP\n• Sales: +1-800-BOT-SALE\n• Available: Mon-Fri 9 AM - 6 PM EST\n\n💬 **Live Chat:**\n• Available on our website\n• Response time: < 2 minutes during business hours\n\n🏢 **Office Address:**\nBusinessBot Inc.\n123 Innovation Drive\nTech City, TC 12345\n\nI can also connect you with a human representative right now if you prefer!',
      keywords: 'contact,phone,email,address,human,person,agent,representative,talk to someone'
    }
  ];

  // Check if FAQs already exist
  db.get("SELECT COUNT(*) as count FROM faqs", (err, row) => {
    if (err) {
      console.error('Error checking FAQs:', err);
      return;
    }
    
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO faqs (category, question, answer, keywords) VALUES (?, ?, ?, ?)");
      defaultFAQs.forEach(faq => {
        stmt.run(faq.category, faq.question, faq.answer, faq.keywords);
      });
      stmt.finalize();
      console.log('Enhanced default FAQs inserted');
    }
  });
});

// Routes
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/auth', authRoutes);

// Existing API routes (enhanced)
app.post('/api/conversations', (req, res) => {
  const { message, sender, sessionId, userId, platform = 'web' } = req.body;
  const id = uuidv4();
  
  db.run(
    "INSERT INTO conversations (id, user_id, message, sender, session_id, platform) VALUES (?, ?, ?, ?, ?, ?)",
    [id, userId || 'anonymous', message, sender, sessionId, platform],
    function(err) {
      if (err) {
        console.error('Error saving conversation:', err);
        return res.status(500).json({ error: 'Failed to save conversation' });
      }
      res.json({ success: true, id: this.lastID });
    }
  );
});

app.get('/api/conversations', (req, res) => {
  const { sessionId, limit = 50, platform } = req.query;
  
  let query = "SELECT * FROM conversations";
  let params = [];
  let conditions = [];
  
  if (sessionId) {
    conditions.push("session_id = ?");
    params.push(sessionId);
  }
  
  if (platform) {
    conditions.push("platform = ?");
    params.push(platform);
  }
  
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  
  query += " ORDER BY timestamp DESC LIMIT ?";
  params.push(parseInt(limit));
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching conversations:', err);
      return res.status(500).json({ error: 'Failed to fetch conversations' });
    }
    res.json(rows);
  });
});

// Enhanced FAQ routes
app.get('/api/faqs', (req, res) => {
  const { category, active = true } = req.query;
  
  let query = "SELECT * FROM faqs";
  let params = [];
  let conditions = [];
  
  if (category) {
    conditions.push("category = ?");
    params.push(category);
  }
  
  if (active !== 'all') {
    conditions.push("active = ?");
    params.push(active === 'true' ? 1 : 0);
  }
  
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  
  query += " ORDER BY category, created_at";
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching FAQs:', err);
      return res.status(500).json({ error: 'Failed to fetch FAQs' });
    }
    res.json(rows);
  });
});

app.post('/api/faqs', (req, res) => {
  const { category, question, answer, keywords } = req.body;
  
  db.run(
    "INSERT INTO faqs (category, question, answer, keywords) VALUES (?, ?, ?, ?)",
    [category, question, answer, keywords],
    function(err) {
      if (err) {
        console.error('Error adding FAQ:', err);
        return res.status(500).json({ error: 'Failed to add FAQ' });
      }
      res.json({ success: true, id: this.lastID });
    }
  );
});

app.put('/api/faqs/:id', (req, res) => {
  const { id } = req.params;
  const { category, question, answer, keywords, active = true } = req.body;
  
  db.run(
    "UPDATE faqs SET category = ?, question = ?, answer = ?, keywords = ?, active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [category, question, answer, keywords, active ? 1 : 0, id],
    function(err) {
      if (err) {
        console.error('Error updating FAQ:', err);
        return res.status(500).json({ error: 'Failed to update FAQ' });
      }
      res.json({ success: true, changes: this.changes });
    }
  );
});

app.delete('/api/faqs/:id', (req, res) => {
  const { id } = req.params;
  
  db.run("DELETE FROM faqs WHERE id = ?", [id], function(err) {
    if (err) {
      console.error('Error deleting FAQ:', err);
      return res.status(500).json({ error: 'Failed to delete FAQ' });
    }
    res.json({ success: true, changes: this.changes });
  });
});

// Enhanced analytics
app.post('/api/analytics', (req, res) => {
  const { sessionId, userQuery, botResponse, escalated, satisfactionScore, intent, responseTime } = req.body;
  
  db.run(
    "INSERT INTO analytics (session_id, user_query, bot_response, escalated, satisfaction_score, intent, response_time) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [sessionId, userQuery, botResponse, escalated ? 1 : 0, satisfactionScore, intent, responseTime],
    function(err) {
      if (err) {
        console.error('Error saving analytics:', err);
        return res.status(500).json({ error: 'Failed to save analytics' });
      }
      res.json({ success: true, id: this.lastID });
    }
  );
});

app.get('/api/analytics', (req, res) => {
  const { period = 7 } = req.query;
  
  const queries = {
    totalConversations: `SELECT COUNT(DISTINCT session_id) as count FROM conversations WHERE timestamp >= datetime('now', '-${period} days')`,
    totalMessages: `SELECT COUNT(*) as count FROM conversations WHERE timestamp >= datetime('now', '-${period} days')`,
    escalationRate: `SELECT (COUNT(CASE WHEN escalated = 1 THEN 1 END) * 100.0 / COUNT(*)) as rate FROM analytics WHERE user_query IS NOT NULL AND timestamp >= datetime('now', '-${period} days')`,
    avgSatisfaction: `SELECT AVG(satisfaction_score) as avg FROM analytics WHERE satisfaction_score IS NOT NULL AND timestamp >= datetime('now', '-${period} days')`,
    topCategories: "SELECT category, COUNT(*) as count FROM faqs WHERE active = 1 GROUP BY category ORDER BY count DESC",
    recentActivity: `SELECT DATE(timestamp) as date, COUNT(*) as messages FROM conversations WHERE timestamp >= datetime('now', '-${period} days') GROUP BY DATE(timestamp) ORDER BY date`,
    intentDistribution: `SELECT intent, COUNT(*) as count FROM analytics WHERE intent IS NOT NULL AND timestamp >= datetime('now', '-${period} days') GROUP BY intent ORDER BY count DESC`,
    avgResponseTime: `SELECT AVG(response_time) as avg FROM analytics WHERE response_time IS NOT NULL AND timestamp >= datetime('now', '-${period} days')`
  };
  
  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;
  
  Object.entries(queries).forEach(([key, query]) => {
    db.all(query, (err, rows) => {
      if (err) {
        console.error(`Error in ${key} query:`, err);
        results[key] = null;
      } else {
        results[key] = rows;
      }
      
      completed++;
      if (completed === total) {
        res.json(results);
      }
    });
  });
});

// Broadcast management
app.get('/api/broadcasts', (req, res) => {
  db.all("SELECT * FROM broadcasts ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      console.error('Error fetching broadcasts:', err);
      return res.status(500).json({ error: 'Failed to fetch broadcasts' });
    }
    res.json(rows);
  });
});

app.post('/api/broadcasts', (req, res) => {
  const { title, message, recipients } = req.body;
  
  db.run(
    "INSERT INTO broadcasts (title, message, recipients) VALUES (?, ?, ?)",
    [title, message, JSON.stringify(recipients)],
    function(err) {
      if (err) {
        console.error('Error creating broadcast:', err);
        return res.status(500).json({ error: 'Failed to create broadcast' });
      }
      res.json({ success: true, id: this.lastID });
    }
  );
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    features: {
      whatsappAPI: !!process.env.WHATSAPP_ACCESS_TOKEN,
      openAI: !!process.env.OPENAI_API_KEY,
      email: !!process.env.SMTP_USER,
      auth: true,
      analytics: true
    }
  });
});

// Initialize scheduled jobs
initializeScheduledJobs(db);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Admin dashboard: http://localhost:${PORT}/admin.html`);
  console.log(`💬 Chat interface: http://localhost:${PORT}/chat.html`);
  console.log(`🌐 Main site: http://localhost:${PORT}/`);
  console.log(`🔧 API health: http://localhost:${PORT}/api/health`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('\n📋 Default Admin Credentials:');
    console.log('Email: admin@businessbot.com');
    console.log('Password: admin123');
    console.log('\n⚠️  Remember to change these credentials in production!');
  }
});

export default app;