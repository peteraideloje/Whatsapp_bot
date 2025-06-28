#!/usr/bin/env node

/**
 * Environment Generator
 * Helps create a properly configured .env file
 */

import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import chalk from 'chalk';

function generateSecureToken(length = 64) {
  return randomBytes(length).toString('hex');
}

function createEnvFile() {
  console.log(chalk.blue('🔧 Generating .env file...\n'));

  const envTemplate = `# WhatsApp Business API Configuration
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=${generateSecureToken(16)}
WHATSAPP_BUSINESS_ACCOUNT_ID=

# Twilio Configuration (Alternative)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# OpenAI Configuration
OPENAI_API_KEY=

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
ADMIN_EMAIL=

# JWT Configuration
JWT_SECRET=${generateSecureToken(32)}

# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL=./bot_data.db
`;

  const envPath = path.join(process.cwd(), '.env');
  
  if (fs.existsSync(envPath)) {
    console.log(chalk.yellow('⚠️  .env file already exists. Creating .env.new instead.'));
    fs.writeFileSync(path.join(process.cwd(), '.env.new'), envTemplate);
    console.log(chalk.green('✅ Created .env.new with secure tokens'));
  } else {
    fs.writeFileSync(envPath, envTemplate);
    console.log(chalk.green('✅ Created .env file with secure tokens'));
  }

  console.log(chalk.blue('\n📝 Next steps:'));
  console.log(chalk.gray('1. Edit .env file and add your WhatsApp credentials'));
  console.log(chalk.gray('2. Run: npm run validate-config'));
  console.log(chalk.gray('3. Follow the setup guide in docs/whatsapp-setup.md'));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createEnvFile();
}