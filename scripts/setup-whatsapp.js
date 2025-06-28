#!/usr/bin/env node

/**
 * WhatsApp Business API Setup Helper
 * This script helps validate your WhatsApp configuration
 */

import dotenv from 'dotenv';
import axios from 'axios';
import chalk from 'chalk';

dotenv.config();

class WhatsAppSetupValidator {
  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
  }

  async validateConfiguration() {
    console.log(chalk.blue('🔍 Validating WhatsApp Business API Configuration...\n'));

    // Check environment variables
    this.checkEnvironmentVariables();

    // Test API connectivity
    await this.testAPIConnectivity();

    // Validate phone number
    await this.validatePhoneNumber();

    // Test webhook endpoint
    await this.testWebhookEndpoint();

    console.log(chalk.green('\n✅ Configuration validation complete!'));
  }

  checkEnvironmentVariables() {
    console.log(chalk.yellow('📋 Checking environment variables...'));

    const requiredVars = [
      'WHATSAPP_PHONE_NUMBER_ID',
      'WHATSAPP_ACCESS_TOKEN',
      'WHATSAPP_WEBHOOK_VERIFY_TOKEN',
      'WHATSAPP_BUSINESS_ACCOUNT_ID'
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
      console.log(chalk.red(`❌ Missing environment variables: ${missing.join(', ')}`));
      console.log(chalk.yellow('Please update your .env file with the required values.'));
      process.exit(1);
    }

    console.log(chalk.green('✅ All environment variables are set'));

    // Validate token format
    if (!this.accessToken.startsWith('EAA')) {
      console.log(chalk.yellow('⚠️  Access token format looks unusual. Make sure it\'s correct.'));
    }

    console.log(chalk.gray(`Phone Number ID: ${this.phoneNumberId}`));
    console.log(chalk.gray(`Access Token: ${this.accessToken.substring(0, 20)}...`));
    console.log(chalk.gray(`Business Account ID: ${this.businessAccountId}`));
  }

  async testAPIConnectivity() {
    console.log(chalk.yellow('\n🌐 Testing API connectivity...'));

    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${this.phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      console.log(chalk.green('✅ API connectivity successful'));
      console.log(chalk.gray(`Phone Number: ${response.data.display_phone_number}`));
      console.log(chalk.gray(`Status: ${response.data.verified_name}`));
    } catch (error) {
      console.log(chalk.red('❌ API connectivity failed'));
      console.log(chalk.red(`Error: ${error.response?.data?.error?.message || error.message}`));
      
      if (error.response?.status === 401) {
        console.log(chalk.yellow('💡 This usually means your access token is invalid or expired.'));
      }
    }
  }

  async validatePhoneNumber() {
    console.log(chalk.yellow('\n📱 Validating phone number configuration...'));

    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${this.businessAccountId}/phone_numbers`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      const phoneNumbers = response.data.data;
      const currentPhone = phoneNumbers.find(phone => phone.id === this.phoneNumberId);

      if (currentPhone) {
        console.log(chalk.green('✅ Phone number configuration valid'));
        console.log(chalk.gray(`Display Name: ${currentPhone.display_phone_number}`));
        console.log(chalk.gray(`Status: ${currentPhone.verified_name}`));
        console.log(chalk.gray(`Quality Rating: ${currentPhone.quality_rating || 'N/A'}`));
      } else {
        console.log(chalk.red('❌ Phone number not found in business account'));
      }
    } catch (error) {
      console.log(chalk.red('❌ Phone number validation failed'));
      console.log(chalk.red(`Error: ${error.response?.data?.error?.message || error.message}`));
    }
  }

  async testWebhookEndpoint() {
    console.log(chalk.yellow('\n🔗 Testing webhook endpoint...'));

    try {
      // Test local webhook endpoint
      const response = await axios.get('http://localhost:3001/api/health');
      
      if (response.status === 200) {
        console.log(chalk.green('✅ Local server is running'));
        console.log(chalk.gray(`Server status: ${response.data.status}`));
        
        // Check if WhatsApp features are enabled
        if (response.data.features?.whatsappAPI) {
          console.log(chalk.green('✅ WhatsApp API features enabled'));
        } else {
          console.log(chalk.yellow('⚠️  WhatsApp API features not fully configured'));
        }
      }
    } catch (error) {
      console.log(chalk.red('❌ Local server not accessible'));
      console.log(chalk.yellow('💡 Make sure your server is running with: npm start'));
    }

    // Provide webhook setup instructions
    console.log(chalk.blue('\n📝 Webhook Setup Instructions:'));
    console.log(chalk.gray('1. Use ngrok to expose your local server:'));
    console.log(chalk.white('   ngrok http 3001'));
    console.log(chalk.gray('2. Copy the HTTPS URL from ngrok'));
    console.log(chalk.gray('3. In Meta Developer Console, set webhook URL to:'));
    console.log(chalk.white('   https://your-ngrok-url.ngrok.io/api/whatsapp/webhook'));
    console.log(chalk.gray(`4. Use verify token: ${this.verifyToken}`));
  }

  async sendTestMessage(phoneNumber, message = 'Hello! This is a test message from your WhatsApp Bot.') {
    console.log(chalk.yellow(`\n📤 Sending test message to ${phoneNumber}...`));

    try {
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(chalk.green('✅ Test message sent successfully'));
      console.log(chalk.gray(`Message ID: ${response.data.messages[0].id}`));
    } catch (error) {
      console.log(chalk.red('❌ Failed to send test message'));
      console.log(chalk.red(`Error: ${error.response?.data?.error?.message || error.message}`));
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const validator = new WhatsAppSetupValidator();

  if (args[0] === 'test-message' && args[1]) {
    await validator.sendTestMessage(args[1]);
  } else {
    await validator.validateConfiguration();
    
    console.log(chalk.blue('\n🚀 Next Steps:'));
    console.log(chalk.gray('1. Set up ngrok: npm install -g ngrok && ngrok http 3001'));
    console.log(chalk.gray('2. Configure webhook in Meta Developer Console'));
    console.log(chalk.gray('3. Test with: node scripts/setup-whatsapp.js test-message +1234567890'));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default WhatsAppSetupValidator;