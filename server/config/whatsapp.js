import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class WhatsAppAPI {
  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.apiUrl = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
    this.verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  }

  async sendMessage(to, message, messageType = 'text') {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: messageType,
      };

      if (messageType === 'text') {
        payload.text = { body: message };
      } else if (messageType === 'interactive') {
        payload.interactive = message;
      } else if (messageType === 'template') {
        payload.template = message;
      }

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendInteractiveMessage(to, headerText, bodyText, buttons) {
    const interactiveMessage = {
      type: 'button',
      header: {
        type: 'text',
        text: headerText
      },
      body: {
        text: bodyText
      },
      action: {
        buttons: buttons.map((button, index) => ({
          type: 'reply',
          reply: {
            id: `btn_${index}`,
            title: button.title
          }
        }))
      }
    };

    return this.sendMessage(to, interactiveMessage, 'interactive');
  }

  async sendListMessage(to, headerText, bodyText, buttonText, sections) {
    const listMessage = {
      type: 'list',
      header: {
        type: 'text',
        text: headerText
      },
      body: {
        text: bodyText
      },
      action: {
        button: buttonText,
        sections: sections
      }
    };

    return this.sendMessage(to, listMessage, 'interactive');
  }

  async markAsRead(messageId) {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      };

      await axios.post(
        `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  verifyWebhook(mode, token, challenge) {
    if (mode === 'subscribe' && token === this.verifyToken) {
      return challenge;
    }
    return null;
  }

  parseWebhookData(body) {
    try {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (!value) return null;

      // Handle incoming messages
      if (value.messages) {
        const message = value.messages[0];
        const contact = value.contacts[0];
        
        return {
          type: 'message',
          messageId: message.id,
          from: message.from,
          timestamp: message.timestamp,
          text: message.text?.body || '',
          messageType: message.type,
          contact: {
            name: contact.profile?.name || 'Unknown',
            waId: contact.wa_id
          }
        };
      }

      // Handle message status updates
      if (value.statuses) {
        const status = value.statuses[0];
        return {
          type: 'status',
          messageId: status.id,
          status: status.status,
          timestamp: status.timestamp,
          recipientId: status.recipient_id
        };
      }

      return null;
    } catch (error) {
      console.error('Error parsing webhook data:', error);
      return null;
    }
  }
}

export default WhatsAppAPI;