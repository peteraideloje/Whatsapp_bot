#!/usr/bin/env node

/**
 * Update Helper Script
 * Helps update and maintain your WhatsApp bot
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class UpdateHelper {
  constructor() {
    this.backupDir = 'backups';
    this.configFiles = ['.env', 'bot_data.db', 'package.json'];
  }

  async start() {
    console.log(chalk.blue.bold('\n🔄 WhatsApp Bot Update Helper\n'));
    
    const action = process.argv[2];
    
    switch (action) {
      case 'backup':
        await this.createBackup();
        break;
      case 'restore':
        await this.restoreBackup();
        break;
      case 'update-deps':
        await this.updateDependencies();
        break;
      case 'migrate-db':
        await this.migrateDatabase();
        break;
      case 'update-faqs':
        await this.updateFAQs();
        break;
      case 'change-admin':
        await this.changeAdminCredentials();
        break;
      case 'update-branding':
        await this.updateBranding();
        break;
      default:
        this.showHelp();
    }
    
    rl.close();
  }

  async createBackup() {
    console.log(chalk.yellow('📦 Creating backup...'));
    
    // Create backup directory
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir);
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `backup_${timestamp}`);
    fs.mkdirSync(backupPath);
    
    // Backup configuration files
    this.configFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(backupPath, file));
        console.log(chalk.green(`✅ Backed up ${file}`));
      }
    });
    
    // Backup logs
    if (fs.existsSync('logs')) {
      execSync(`cp -r logs ${backupPath}/`);
      console.log(chalk.green('✅ Backed up logs'));
    }
    
    console.log(chalk.green(`\n🎉 Backup created: ${backupPath}`));
  }

  async restoreBackup() {
    console.log(chalk.yellow('📥 Available backups:'));
    
    if (!fs.existsSync(this.backupDir)) {
      console.log(chalk.red('❌ No backups found'));
      return;
    }
    
    const backups = fs.readdirSync(this.backupDir)
      .filter(dir => dir.startsWith('backup_'))
      .sort()
      .reverse();
    
    if (backups.length === 0) {
      console.log(chalk.red('❌ No backups found'));
      return;
    }
    
    backups.forEach((backup, index) => {
      console.log(chalk.gray(`${index + 1}. ${backup}`));
    });
    
    const choice = await this.question('\nSelect backup number to restore: ');
    const selectedBackup = backups[parseInt(choice) - 1];
    
    if (!selectedBackup) {
      console.log(chalk.red('❌ Invalid selection'));
      return;
    }
    
    const confirm = await this.question(
      chalk.yellow(`⚠️  This will overwrite current files. Continue? (y/N): `)
    );
    
    if (confirm.toLowerCase() !== 'y') {
      console.log(chalk.blue('Restore cancelled'));
      return;
    }
    
    const backupPath = path.join(this.backupDir, selectedBackup);
    
    // Restore files
    this.configFiles.forEach(file => {
      const backupFile = path.join(backupPath, file);
      if (fs.existsSync(backupFile)) {
        fs.copyFileSync(backupFile, file);
        console.log(chalk.green(`✅ Restored ${file}`));
      }
    });
    
    console.log(chalk.green('\n🎉 Backup restored successfully'));
    console.log(chalk.yellow('💡 Restart your server: npm start'));
  }

  async updateDependencies() {
    console.log(chalk.yellow('📦 Updating dependencies...'));
    
    try {
      // Check for outdated packages
      console.log(chalk.gray('Checking for updates...'));
      execSync('npm outdated', { stdio: 'inherit' });
      
      const update = await this.question('Update all dependencies? (y/N): ');
      
      if (update.toLowerCase() === 'y') {
        console.log(chalk.gray('Updating packages...'));
        execSync('npm update', { stdio: 'inherit' });
        
        console.log(chalk.gray('Checking for security vulnerabilities...'));
        execSync('npm audit fix', { stdio: 'inherit' });
        
        console.log(chalk.green('✅ Dependencies updated'));
      }
    } catch (error) {
      console.log(chalk.yellow('⚠️  Some packages may be up to date'));
    }
  }

  async migrateDatabase() {
    console.log(chalk.yellow('🗄️  Database migration...'));
    
    const sqlite3 = await import('sqlite3');
    const db = new sqlite3.Database('./bot_data.db');
    
    // Add new columns if they don't exist
    const migrations = [
      {
        name: 'Add platform column to conversations',
        sql: `ALTER TABLE conversations ADD COLUMN platform TEXT DEFAULT 'whatsapp'`
      },
      {
        name: 'Add intent column to analytics',
        sql: `ALTER TABLE analytics ADD COLUMN intent TEXT`
      },
      {
        name: 'Add response_time column to analytics',
        sql: `ALTER TABLE analytics ADD COLUMN response_time INTEGER`
      }
    ];
    
    for (const migration of migrations) {
      try {
        await new Promise((resolve, reject) => {
          db.run(migration.sql, (err) => {
            if (err && !err.message.includes('duplicate column')) {
              reject(err);
            } else {
              console.log(chalk.green(`✅ ${migration.name}`));
              resolve();
            }
          });
        });
      } catch (error) {
        console.log(chalk.yellow(`⚠️  ${migration.name}: ${error.message}`));
      }
    }
    
    db.close();
    console.log(chalk.green('🎉 Database migration complete'));
  }

  async updateFAQs() {
    console.log(chalk.yellow('💬 FAQ Update Helper'));
    console.log(chalk.gray('This will help you bulk update FAQs\n'));
    
    const action = await this.question('What would you like to do?\n1. Import FAQs from CSV\n2. Export FAQs to CSV\n3. Add sample FAQs\nChoice (1-3): ');
    
    switch (action) {
      case '1':
        await this.importFAQsFromCSV();
        break;
      case '2':
        await this.exportFAQsToCSV();
        break;
      case '3':
        await this.addSampleFAQs();
        break;
      default:
        console.log(chalk.red('Invalid choice'));
    }
  }

  async addSampleFAQs() {
    const sampleFAQs = [
      {
        category: 'general',
        question: 'What are your business hours?',
        answer: '🕒 **Business Hours:**\n\nMonday - Friday: 9 AM - 6 PM\nSaturday: 10 AM - 4 PM\nSunday: Closed\n\nOur bot is available 24/7 for basic inquiries!',
        keywords: 'hours,time,open,closed,schedule'
      },
      {
        category: 'contact',
        question: 'How can I contact customer support?',
        answer: '📞 **Contact Support:**\n\n• **Phone:** +1-800-SUPPORT\n• **Email:** support@yourcompany.com\n• **Live Chat:** Available on our website\n• **WhatsApp:** Right here!\n\nI can also connect you with a human agent right now!',
        keywords: 'contact,support,help,phone,email'
      },
      {
        category: 'products',
        question: 'Do you offer refunds?',
        answer: '💰 **Refund Policy:**\n\nYes! We offer a 30-day money-back guarantee on all our products.\n\n**To request a refund:**\n1. Contact our support team\n2. Provide your order number\n3. Explain the reason for refund\n\nRefunds are processed within 5-7 business days.',
        keywords: 'refund,money back,return,guarantee'
      }
    ];
    
    console.log(chalk.gray('Adding sample FAQs...'));
    
    const sqlite3 = await import('sqlite3');
    const db = new sqlite3.Database('./bot_data.db');
    
    for (const faq of sampleFAQs) {
      await new Promise((resolve) => {
        db.run(
          'INSERT INTO faqs (category, question, answer, keywords) VALUES (?, ?, ?, ?)',
          [faq.category, faq.question, faq.answer, faq.keywords],
          () => {
            console.log(chalk.green(`✅ Added: ${faq.question}`));
            resolve();
          }
        );
      });
    }
    
    db.close();
    console.log(chalk.green('🎉 Sample FAQs added successfully'));
  }

  async changeAdminCredentials() {
    console.log(chalk.yellow('👤 Change Admin Credentials'));
    
    const newEmail = await this.question('New admin email: ');
    const newPassword = await this.question('New admin password: ');
    const newName = await this.question('Admin name: ');
    
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const sqlite3 = await import('sqlite3');
    const db = new sqlite3.Database('./bot_data.db');
    
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET email = ?, password = ?, name = ? WHERE id = 1',
        [newEmail, hashedPassword, newName],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    db.close();
    
    console.log(chalk.green('✅ Admin credentials updated'));
    console.log(chalk.gray(`New login: ${newEmail} / ${newPassword}`));
  }

  async updateBranding() {
    console.log(chalk.yellow('🎨 Update Branding'));
    
    const companyName = await this.question('Company name: ');
    const primaryColor = await this.question('Primary color (hex, e.g., #25D366): ');
    const logoUrl = await this.question('Logo URL (optional): ');
    
    // Update main.js
    let mainContent = fs.readFileSync('main.js', 'utf8');
    mainContent = mainContent.replace(/BusinessBot/g, companyName);
    fs.writeFileSync('main.js', mainContent);
    
    // Update style.css
    let styleContent = fs.readFileSync('style.css', 'utf8');
    if (primaryColor) {
      styleContent = styleContent.replace(/--primary: #25D366;/, `--primary: ${primaryColor};`);
    }
    fs.writeFileSync('style.css', styleContent);
    
    // Update admin files
    let adminContent = fs.readFileSync('admin.html', 'utf8');
    adminContent = adminContent.replace(/BusinessBot Admin/g, `${companyName} Admin`);
    fs.writeFileSync('admin.html', adminContent);
    
    console.log(chalk.green('✅ Branding updated'));
    console.log(chalk.yellow('💡 Restart your server to see changes'));
  }

  showHelp() {
    console.log(chalk.blue('🛠️  WhatsApp Bot Update Helper\n'));
    console.log(chalk.gray('Available commands:\n'));
    console.log(chalk.white('npm run update backup') + chalk.gray('        - Create backup of current setup'));
    console.log(chalk.white('npm run update restore') + chalk.gray('       - Restore from backup'));
    console.log(chalk.white('npm run update update-deps') + chalk.gray('    - Update npm dependencies'));
    console.log(chalk.white('npm run update migrate-db') + chalk.gray('     - Run database migrations'));
    console.log(chalk.white('npm run update update-faqs') + chalk.gray('    - Manage FAQ database'));
    console.log(chalk.white('npm run update change-admin') + chalk.gray('   - Change admin credentials'));
    console.log(chalk.white('npm run update update-branding') + chalk.gray(' - Update company branding'));
    
    console.log(chalk.blue('\n📚 Examples:'));
    console.log(chalk.gray('node scripts/update-helper.js backup'));
    console.log(chalk.gray('node scripts/update-helper.js update-faqs'));
    console.log(chalk.gray('node scripts/update-helper.js change-admin'));
  }

  question(prompt) {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  new UpdateHelper().start();
}