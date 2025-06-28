#!/usr/bin/env node

/**
 * Interactive WhatsApp Setup Wizard
 * Guides users through the complete setup process
 */

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import chalk from 'chalk';
import axios from 'axios';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class SetupWizard {
  constructor() {
    this.config = {};
    this.envPath = path.join(process.cwd(), '.env');
  }

  async start() {
    console.log(chalk.blue.bold('\n🚀 WhatsApp Business Bot Setup Wizard\n'));
    console.log(chalk.gray('This wizard will guide you through setting up your WhatsApp Business API bot.\n'));

    try {
      await this.checkExistingConfig();
      await this.gatherCredentials();
      await this.setupOptionalServices();
      await this.generateConfig();
      await this.validateSetup();
      await this.showNextSteps();
    } catch (error) {
      console.log(chalk.red(`\n❌ Setup failed: ${error.message}`));
    } finally {
      rl.close();
    }
  }

  async checkExistingConfig() {
    if (fs.existsSync(this.envPath)) {
      const overwrite = await this.question(
        chalk.yellow('⚠️  .env file already exists. Overwrite? (y/N): ')
      );
      
      if (overwrite.toLowerCase() !== 'y') {
        console.log(chalk.blue('Setup cancelled. Your existing .env file is preserved.'));
        process.exit(0);
      }
    }
  }

  async gatherCredentials() {
    console.log(chalk.blue('\n📱 WhatsApp Business API Credentials'));
    console.log(chalk.gray('Get these from: https://developers.facebook.com/\n'));

    this.config.WHATSAPP_PHONE_NUMBER_ID = await this.question('Phone Number ID: ');
    this.config.WHATSAPP_ACCESS_TOKEN = await this.question('Access Token: ');
    this.config.WHATSAPP_BUSINESS_ACCOUNT_ID = await this.question('Business Account ID: ');
    
    // Generate secure webhook verify token
    this.config.WHATSAPP_WEBHOOK_VERIFY_TOKEN = randomBytes(16).toString('hex');
    console.log(chalk.green(`✅ Generated webhook verify token: ${this.config.WHATSAPP_WEBHOOK_VERIFY_TOKEN}`));
  }

  async setupOptionalServices() {
    console.log(chalk.blue('\n🔧 Optional Services Setup'));

    // OpenAI
    const useOpenAI = await this.question('Enable OpenAI for smarter responses? (Y/n): ');
    if (useOpenAI.toLowerCase() !== 'n') {
      this.config.OPENAI_API_KEY = await this.question('OpenAI API Key (optional): ');
    }

    // Email notifications
    const useEmail = await this.question('Enable email notifications? (Y/n): ');
    if (useEmail.toLowerCase() !== 'n') {
      console.log(chalk.gray('Email configuration for escalation alerts:'));
      this.config.SMTP_HOST = await this.question('SMTP Host (default: smtp.gmail.com): ') || 'smtp.gmail.com';
      this.config.SMTP_PORT = await this.question('SMTP Port (default: 587): ') || '587';
      this.config.SMTP_USER = await this.question('SMTP Username: ');
      this.config.SMTP_PASS = await this.question('SMTP Password: ');
      this.config.ADMIN_EMAIL = await this.question('Admin Email: ');
    }

    // Twilio (alternative)
    const useTwilio = await this.question('Enable Twilio as backup? (y/N): ');
    if (useTwilio.toLowerCase() === 'y') {
      this.config.TWILIO_ACCOUNT_SID = await this.question('Twilio Account SID: ');
      this.config.TWILIO_AUTH_TOKEN = await this.question('Twilio Auth Token: ');
      this.config.TWILIO_WHATSAPP_NUMBER = await this.question('Twilio WhatsApp Number: ');
    }
  }

  async generateConfig() {
    console.log(chalk.blue('\n⚙️  Generating configuration...'));

    // Generate secure JWT secret
    this.config.JWT_SECRET = randomBytes(32).toString('hex');
    this.config.PORT = '3001';
    this.config.NODE_ENV = 'development';
    this.config.DATABASE_URL = './bot_data.db';

    const envContent = this.buildEnvContent();
    fs.writeFileSync(this.envPath, envContent);
    
    console.log(chalk.green('✅ Configuration saved to .env'));
  }

  buildEnvContent() {
    return `# WhatsApp Business API Configuration
WHATSAPP_PHONE_NUMBER_ID=${this.config.WHATSAPP_PHONE_NUMBER_ID || ''}
WHATSAPP_ACCESS_TOKEN=${this.config.WHATSAPP_ACCESS_TOKEN || ''}
WHATSAPP_WEBHOOK_VERIFY_TOKEN=${this.config.WHATSAPP_WEBHOOK_VERIFY_TOKEN || ''}
WHATSAPP_BUSINESS_ACCOUNT_ID=${this.config.WHATSAPP_BUSINESS_ACCOUNT_ID || ''}

# Twilio Configuration (Alternative)
TWILIO_ACCOUNT_SID=${this.config.TWILIO_ACCOUNT_SID || ''}
TWILIO_AUTH_TOKEN=${this.config.TWILIO_AUTH_TOKEN || ''}
TWILIO_WHATSAPP_NUMBER=${this.config.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'}

# OpenAI Configuration
OPENAI_API_KEY=${this.config.OPENAI_API_KEY || ''}

# Email Configuration
SMTP_HOST=${this.config.SMTP_HOST || 'smtp.gmail.com'}
SMTP_PORT=${this.config.SMTP_PORT || '587'}
SMTP_USER=${this.config.SMTP_USER || ''}
SMTP_PASS=${this.config.SMTP_PASS || ''}
ADMIN_EMAIL=${this.config.ADMIN_EMAIL || ''}

# JWT Configuration
JWT_SECRET=${this.config.JWT_SECRET}

# Server Configuration
PORT=${this.config.PORT}
NODE_ENV=${this.config.NODE_ENV}

# Database Configuration
DATABASE_URL=${this.config.DATABASE_URL}
`;
  }

  async validateSetup() {
    if (!this.config.WHATSAPP_PHONE_NUMBER_ID || !this.config.WHATSAPP_ACCESS_TOKEN) {
      console.log(chalk.yellow('\n⚠️  Skipping validation - missing required credentials'));
      return;
    }

    console.log(chalk.blue('\n🔍 Validating WhatsApp API connection...'));

    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${this.config.WHATSAPP_PHONE_NUMBER_ID}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.WHATSAPP_ACCESS_TOKEN}`
          }
        }
      );

      console.log(chalk.green('✅ WhatsApp API connection successful'));
      console.log(chalk.gray(`Phone: ${response.data.display_phone_number}`));
    } catch (error) {
      console.log(chalk.red('❌ WhatsApp API validation failed'));
      console.log(chalk.yellow('💡 Please check your credentials and try again'));
    }
  }

  async showNextSteps() {
    console.log(chalk.green.bold('\n🎉 Setup Complete!\n'));
    
    console.log(chalk.blue('📋 Next Steps:'));
    console.log(chalk.white('1. Start your server:'));
    console.log(chalk.gray('   npm start\n'));
    
    console.log(chalk.white('2. Set up ngrok for webhook:'));
    console.log(chalk.gray('   npm install -g ngrok'));
    console.log(chalk.gray('   ngrok http 3001\n'));
    
    console.log(chalk.white('3. Configure webhook in Meta Developer Console:'));
    console.log(chalk.gray('   URL: https://your-ngrok-url.ngrok.io/api/whatsapp/webhook'));
    console.log(chalk.gray(`   Verify Token: ${this.config.WHATSAPP_WEBHOOK_VERIFY_TOKEN}\n`));
    
    console.log(chalk.white('4. Test your bot:'));
    console.log(chalk.gray('   npm run setup-whatsapp test-message +1234567890\n'));
    
    console.log(chalk.white('5. Access admin dashboard:'));
    console.log(chalk.gray('   http://localhost:5173/admin-login.html'));
    console.log(chalk.gray('   Email: admin@businessbot.com'));
    console.log(chalk.gray('   Password: admin123\n'));
    
    console.log(chalk.blue('📚 Documentation:'));
    console.log(chalk.gray('   Full guide: docs/whatsapp-setup.md'));
    console.log(chalk.gray('   Quick start: docs/quick-start.md\n'));
  }

  question(prompt) {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  new SetupWizard().start();
}