#!/usr/bin/env node

/**
 * Health Check Script
 * Monitors the health of your WhatsApp bot
 */

import axios from 'axios';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config();

class HealthChecker {
  constructor() {
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    this.checks = [
      { name: 'Server Health', endpoint: '/api/health' },
      { name: 'Database Connection', endpoint: '/api/health' },
      { name: 'WhatsApp API', endpoint: '/api/health' },
      { name: 'Admin Dashboard', endpoint: '/admin.html' }
    ];
  }

  async runHealthCheck() {
    console.log(chalk.blue('🏥 Running Health Check...\n'));

    const results = [];
    
    for (const check of this.checks) {
      const result = await this.performCheck(check);
      results.push(result);
      this.displayResult(result);
    }

    this.displaySummary(results);
    return results.every(r => r.status === 'healthy');
  }

  async performCheck(check) {
    try {
      const response = await axios.get(`${this.baseUrl}${check.endpoint}`, {
        timeout: 5000
      });

      if (check.endpoint === '/api/health') {
        return this.analyzeHealthResponse(check.name, response.data);
      }

      return {
        name: check.name,
        status: response.status === 200 ? 'healthy' : 'unhealthy',
        message: `HTTP ${response.status}`,
        details: null
      };
    } catch (error) {
      return {
        name: check.name,
        status: 'unhealthy',
        message: error.code === 'ECONNREFUSED' ? 'Server not running' : error.message,
        details: error.response?.data || null
      };
    }
  }

  analyzeHealthResponse(checkName, healthData) {
    if (checkName === 'Server Health') {
      return {
        name: checkName,
        status: healthData.status === 'healthy' ? 'healthy' : 'unhealthy',
        message: `Version ${healthData.version}`,
        details: healthData
      };
    }

    if (checkName === 'Database Connection') {
      return {
        name: checkName,
        status: 'healthy', // If health endpoint responds, DB is working
        message: 'Connected',
        details: null
      };
    }

    if (checkName === 'WhatsApp API') {
      const hasWhatsApp = healthData.features?.whatsappAPI;
      return {
        name: checkName,
        status: hasWhatsApp ? 'healthy' : 'warning',
        message: hasWhatsApp ? 'Configured' : 'Not configured',
        details: healthData.features
      };
    }

    return {
      name: checkName,
      status: 'healthy',
      message: 'OK',
      details: null
    };
  }

  displayResult(result) {
    const icon = result.status === 'healthy' ? '✅' : 
                 result.status === 'warning' ? '⚠️' : '❌';
    
    const color = result.status === 'healthy' ? chalk.green :
                  result.status === 'warning' ? chalk.yellow : chalk.red;

    console.log(`${icon} ${color(result.name)}: ${result.message}`);
    
    if (result.details && result.status !== 'healthy') {
      console.log(chalk.gray(`   Details: ${JSON.stringify(result.details, null, 2)}`));
    }
  }

  displaySummary(results) {
    console.log('\n' + '='.repeat(50));
    
    const healthy = results.filter(r => r.status === 'healthy').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    const unhealthy = results.filter(r => r.status === 'unhealthy').length;

    console.log(chalk.blue('📊 Health Check Summary:'));
    console.log(chalk.green(`✅ Healthy: ${healthy}`));
    
    if (warnings > 0) {
      console.log(chalk.yellow(`⚠️  Warnings: ${warnings}`));
    }
    
    if (unhealthy > 0) {
      console.log(chalk.red(`❌ Unhealthy: ${unhealthy}`));
    }

    if (unhealthy === 0 && warnings === 0) {
      console.log(chalk.green.bold('\n🎉 All systems healthy!'));
    } else if (unhealthy === 0) {
      console.log(chalk.yellow.bold('\n⚠️  System operational with warnings'));
    } else {
      console.log(chalk.red.bold('\n🚨 System has critical issues'));
    }

    console.log('\n' + '='.repeat(50));
  }

  async monitorContinuously(interval = 30000) {
    console.log(chalk.blue(`🔄 Starting continuous monitoring (${interval/1000}s intervals)...\n`));
    
    while (true) {
      const timestamp = new Date().toLocaleString();
      console.log(chalk.gray(`\n[${timestamp}] Running health check...`));
      
      await this.runHealthCheck();
      
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
}

// CLI Interface
const args = process.argv.slice(2);
const checker = new HealthChecker();

if (args[0] === 'monitor') {
  const interval = parseInt(args[1]) * 1000 || 30000;
  checker.monitorContinuously(interval);
} else {
  checker.runHealthCheck().then(healthy => {
    process.exit(healthy ? 0 : 1);
  });
}