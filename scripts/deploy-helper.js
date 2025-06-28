#!/usr/bin/env node

/**
 * Deployment Helper
 * Assists with deploying to various platforms
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';

class DeploymentHelper {
  constructor() {
    this.platforms = {
      railway: this.deployToRailway.bind(this),
      heroku: this.deployToHeroku.bind(this),
      docker: this.deployWithDocker.bind(this),
      pm2: this.deployWithPM2.bind(this)
    };
  }

  async deploy(platform) {
    console.log(chalk.blue(`🚀 Deploying to ${platform}...\n`));

    if (!this.platforms[platform]) {
      console.log(chalk.red(`❌ Unknown platform: ${platform}`));
      console.log(chalk.gray('Available platforms: railway, heroku, docker, pm2'));
      return;
    }

    try {
      await this.checkPrerequisites();
      await this.platforms[platform]();
      console.log(chalk.green(`\n✅ Deployment to ${platform} completed!`));
    } catch (error) {
      console.log(chalk.red(`\n❌ Deployment failed: ${error.message}`));
    }
  }

  async checkPrerequisites() {
    console.log(chalk.yellow('🔍 Checking prerequisites...'));

    // Check if .env exists
    if (!fs.existsSync('.env')) {
      throw new Error('.env file not found. Run setup wizard first.');
    }

    // Check if build works
    try {
      execSync('npm run build', { stdio: 'pipe' });
      console.log(chalk.green('✅ Build successful'));
    } catch (error) {
      throw new Error('Build failed. Fix build errors first.');
    }
  }

  async deployToRailway() {
    console.log(chalk.blue('🚂 Deploying to Railway...'));

    try {
      // Check if Railway CLI is installed
      execSync('railway --version', { stdio: 'pipe' });
    } catch (error) {
      console.log(chalk.yellow('Installing Railway CLI...'));
      execSync('npm install -g @railway/cli', { stdio: 'inherit' });
    }

    // Initialize Railway project
    console.log(chalk.gray('Initializing Railway project...'));
    execSync('railway login', { stdio: 'inherit' });
    execSync('railway init', { stdio: 'inherit' });

    // Set environment variables
    console.log(chalk.gray('Setting environment variables...'));
    this.setRailwayEnvVars();

    // Deploy
    console.log(chalk.gray('Deploying...'));
    execSync('railway up', { stdio: 'inherit' });

    console.log(chalk.green('🎉 Railway deployment complete!'));
    console.log(chalk.gray('Your app will be available at the Railway-provided URL.'));
  }

  async deployToHeroku() {
    console.log(chalk.blue('🟣 Deploying to Heroku...'));

    try {
      execSync('heroku --version', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('Heroku CLI not found. Install from: https://devcenter.heroku.com/articles/heroku-cli');
    }

    const appName = `whatsapp-bot-${Date.now()}`;
    
    // Create Heroku app
    console.log(chalk.gray(`Creating Heroku app: ${appName}...`));
    execSync(`heroku create ${appName}`, { stdio: 'inherit' });

    // Set environment variables
    console.log(chalk.gray('Setting environment variables...'));
    this.setHerokuEnvVars(appName);

    // Deploy
    console.log(chalk.gray('Deploying...'));
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Deploy to Heroku" || true', { stdio: 'inherit' });
    execSync('git push heroku main', { stdio: 'inherit' });

    console.log(chalk.green('🎉 Heroku deployment complete!'));
    console.log(chalk.gray(`Your app: https://${appName}.herokuapp.com`));
  }

  async deployWithDocker() {
    console.log(chalk.blue('🐳 Deploying with Docker...'));

    try {
      execSync('docker --version', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('Docker not found. Install from: https://docker.com');
    }

    // Build Docker image
    console.log(chalk.gray('Building Docker image...'));
    execSync('docker build -t whatsapp-business-bot .', { stdio: 'inherit' });

    // Run with Docker Compose
    console.log(chalk.gray('Starting with Docker Compose...'));
    execSync('docker-compose up -d', { stdio: 'inherit' });

    console.log(chalk.green('🎉 Docker deployment complete!'));
    console.log(chalk.gray('Your app is running at: http://localhost:3001'));
  }

  async deployWithPM2() {
    console.log(chalk.blue('⚡ Deploying with PM2...'));

    try {
      execSync('pm2 --version', { stdio: 'pipe' });
    } catch (error) {
      console.log(chalk.yellow('Installing PM2...'));
      execSync('npm install -g pm2', { stdio: 'inherit' });
    }

    // Start with PM2
    console.log(chalk.gray('Starting with PM2...'));
    execSync('pm2 start ecosystem.config.js --env production', { stdio: 'inherit' });
    execSync('pm2 save', { stdio: 'inherit' });
    execSync('pm2 startup', { stdio: 'inherit' });

    console.log(chalk.green('🎉 PM2 deployment complete!'));
    console.log(chalk.gray('Your app is running with PM2 process manager.'));
  }

  setRailwayEnvVars() {
    const envContent = fs.readFileSync('.env', 'utf8');
    const envVars = this.parseEnvFile(envContent);

    Object.entries(envVars).forEach(([key, value]) => {
      if (value) {
        try {
          execSync(`railway variables set ${key}="${value}"`, { stdio: 'pipe' });
        } catch (error) {
          console.log(chalk.yellow(`⚠️  Failed to set ${key}`));
        }
      }
    });
  }

  setHerokuEnvVars(appName) {
    const envContent = fs.readFileSync('.env', 'utf8');
    const envVars = this.parseEnvFile(envContent);

    Object.entries(envVars).forEach(([key, value]) => {
      if (value) {
        try {
          execSync(`heroku config:set ${key}="${value}" --app ${appName}`, { stdio: 'pipe' });
        } catch (error) {
          console.log(chalk.yellow(`⚠️  Failed to set ${key}`));
        }
      }
    });
  }

  parseEnvFile(content) {
    const vars = {};
    content.split('\n').forEach(line => {
      const match = line.match(/^([^#][^=]+)=(.*)$/);
      if (match) {
        vars[match[1].trim()] = match[2].trim();
      }
    });
    return vars;
  }
}

// CLI Interface
const platform = process.argv[2];
if (!platform) {
  console.log(chalk.blue('🚀 Deployment Helper\n'));
  console.log(chalk.gray('Usage: node scripts/deploy-helper.js <platform>\n'));
  console.log(chalk.gray('Available platforms:'));
  console.log(chalk.gray('  railway  - Deploy to Railway'));
  console.log(chalk.gray('  heroku   - Deploy to Heroku'));
  console.log(chalk.gray('  docker   - Deploy with Docker'));
  console.log(chalk.gray('  pm2      - Deploy with PM2'));
} else {
  new DeploymentHelper().deploy(platform);
}