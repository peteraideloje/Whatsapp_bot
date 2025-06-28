import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendEscalationAlert(customerInfo, conversation) {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: process.env.ADMIN_EMAIL,
        subject: '🚨 WhatsApp Bot Escalation Alert',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #25D366;">Customer Escalation Required</h2>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Customer Information:</h3>
              <p><strong>Name:</strong> ${customerInfo.name}</p>
              <p><strong>Phone:</strong> ${customerInfo.phone}</p>
              <p><strong>Session ID:</strong> ${customerInfo.sessionId}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="background: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
              <h3>Recent Conversation:</h3>
              <div style="max-height: 300px; overflow-y: auto;">
                ${conversation.map(msg => `
                  <div style="margin: 10px 0; padding: 10px; background: ${msg.sender === 'user' ? '#DCF8C6' : '#f0f0f0'}; border-radius: 8px;">
                    <strong>${msg.sender === 'user' ? 'Customer' : 'Bot'}:</strong> ${msg.message}
                    <br><small style="color: #666;">${new Date(msg.timestamp).toLocaleString()}</small>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div style="margin: 20px 0; padding: 15px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px;">
              <p><strong>Action Required:</strong> Please contact the customer as soon as possible to provide personalized assistance.</p>
            </div>
            
            <p style="color: #666; font-size: 12px;">
              This is an automated message from your WhatsApp Business Bot system.
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Escalation email sent successfully');
    } catch (error) {
      console.error('Error sending escalation email:', error);
    }
  }

  async sendDailyReport(stats) {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: process.env.ADMIN_EMAIL,
        subject: '📊 Daily WhatsApp Bot Report',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #25D366;">Daily Bot Performance Report</h2>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                <h3 style="color: #25D366; margin: 0;">${stats.totalConversations}</h3>
                <p style="margin: 5px 0;">Total Conversations</p>
              </div>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                <h3 style="color: #25D366; margin: 0;">${stats.totalMessages}</h3>
                <p style="margin: 5px 0;">Messages Processed</p>
              </div>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                <h3 style="color: #25D366; margin: 0;">${stats.escalationRate}%</h3>
                <p style="margin: 5px 0;">Escalation Rate</p>
              </div>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                <h3 style="color: #25D366; margin: 0;">${stats.avgSatisfaction}</h3>
                <p style="margin: 5px 0;">Avg Satisfaction</p>
              </div>
            </div>
            
            <p style="color: #666; font-size: 12px;">
              This is an automated daily report from your WhatsApp Business Bot system.
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Daily report sent successfully');
    } catch (error) {
      console.error('Error sending daily report:', error);
    }
  }
}

export default EmailService;