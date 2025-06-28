import express from 'express';
import WhatsAppAPI from '../config/whatsapp.js';
import OpenAIService from '../config/openai.js';
import EmailService from '../config/email.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const whatsapp = new WhatsAppAPI();
const openai = new OpenAIService();
const emailService = new EmailService();

// Webhook verification
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verificationResult = whatsapp.verifyWebhook(mode, token, challenge);
  
  if (verificationResult) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

// Webhook handler
router.post('/webhook', async (req, res) => {
  try {
    const webhookData = whatsapp.parseWebhookData(req.body);
    
    if (!webhookData) {
      return res.status(200).send('OK');
    }

    if (webhookData.type === 'message') {
      await handleIncomingMessage(webhookData, req.db);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});

async function handleIncomingMessage(messageData, db) {
  try {
    const { messageId, from, text, contact } = messageData;
    
    // Mark message as read
    await whatsapp.markAsRead(messageId);

    // Generate session ID for this conversation
    const sessionId = `wa_${from}_${Date.now()}`;

    // Save incoming message
    await saveMessage(db, {
      message: text,
      sender: 'user',
      sessionId,
      userId: from,
      messageId,
      contactName: contact.name
    });

    // Get FAQs for context
    const faqs = await getFAQs(db);
    
    // Analyze intent
    const intent = await openai.analyzeIntent(text);
    
    // Generate AI response
    const aiResponse = await openai.generateResponse(text, `Customer name: ${contact.name}`, faqs);
    
    // Check if escalation is needed
    const needsEscalation = await checkEscalation(text, intent, aiResponse);
    
    let botResponse = aiResponse;
    
    if (needsEscalation) {
      botResponse = "I understand you need personalized assistance. Let me connect you with one of our human representatives who can better help you. Someone will contact you shortly.";
      
      // Send escalation email
      const recentConversation = await getRecentConversation(db, sessionId);
      await emailService.sendEscalationAlert({
        name: contact.name,
        phone: from,
        sessionId
      }, recentConversation);
    }

    // Send response via WhatsApp
    await whatsapp.sendMessage(from, botResponse);

    // Save bot response
    await saveMessage(db, {
      message: botResponse,
      sender: 'bot',
      sessionId,
      userId: from
    });

    // Save analytics
    await saveAnalytics(db, {
      sessionId,
      userQuery: text,
      botResponse,
      escalated: needsEscalation,
      intent
    });

  } catch (error) {
    console.error('Error handling incoming message:', error);
    
    // Send error response
    try {
      await whatsapp.sendMessage(messageData.from, "I'm experiencing technical difficulties. Please try again in a moment or contact our support team directly.");
    } catch (sendError) {
      console.error('Error sending error message:', sendError);
    }
  }
}

async function saveMessage(db, messageData) {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    db.run(
      "INSERT INTO conversations (id, user_id, message, sender, session_id, message_id, contact_name) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, messageData.userId, messageData.message, messageData.sender, messageData.sessionId, messageData.messageId || null, messageData.contactName || null],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

async function getFAQs(db) {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM faqs ORDER BY category", (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

async function saveAnalytics(db, analyticsData) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO analytics (session_id, user_query, bot_response, escalated, intent, satisfaction_score, response_time) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [analyticsData.sessionId, analyticsData.userQuery, analyticsData.botResponse, analyticsData.escalated ? 1 : 0, analyticsData.intent, undefined, undefined],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

async function getRecentConversation(db, sessionId) {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM conversations WHERE session_id = ? ORDER BY timestamp DESC LIMIT 10",
      [sessionId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
}

async function checkEscalation(message, intent, aiResponse) {
  // Escalation triggers
  const escalationKeywords = [
    'speak to human', 'talk to person', 'human agent', 'customer service',
    'complaint', 'angry', 'frustrated', 'not working', 'broken',
    'refund', 'cancel', 'billing issue', 'payment problem'
  ];

  const messageText = message.toLowerCase();
  const hasEscalationKeyword = escalationKeywords.some(keyword => 
    messageText.includes(keyword)
  );

  // Escalate if specific keywords found or if it's a complaint
  return hasEscalationKeyword || intent === 'complaint' || intent === 'contact';
}

// Send broadcast message
router.post('/broadcast', async (req, res) => {
  try {
    const { recipients, message, messageType = 'text' } = req.body;
    
    const results = [];
    
    for (const recipient of recipients) {
      try {
        const result = await whatsapp.sendMessage(recipient, message, messageType);
        results.push({ recipient, success: true, messageId: result.messages[0].id });
      } catch (error) {
        results.push({ recipient, success: false, error: error.message });
      }
    }
    
    res.json({ success: true, results });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ error: 'Failed to send broadcast' });
  }
});

export default router;