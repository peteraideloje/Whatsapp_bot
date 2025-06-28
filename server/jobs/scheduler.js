import cron from 'node-cron';
import EmailService from '../config/email.js';

const emailService = new EmailService();

export function initializeScheduledJobs(db) {
  // Daily report at 9 AM
  cron.schedule('0 9 * * *', async () => {
    try {
      console.log('Generating daily report...');
      
      const stats = await getDailyStats(db);
      await emailService.sendDailyReport(stats);
      
      console.log('Daily report sent successfully');
    } catch (error) {
      console.error('Error sending daily report:', error);
    }
  });

  // Weekly cleanup of old data (keep last 90 days)
  cron.schedule('0 2 * * 0', async () => {
    try {
      console.log('Cleaning up old data...');
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);
      
      await cleanupOldData(db, cutoffDate);
      
      console.log('Data cleanup completed');
    } catch (error) {
      console.error('Error during data cleanup:', error);
    }
  });
}

async function getDailyStats(db) {
  return new Promise((resolve, reject) => {
    const today = new Date().toISOString().split('T')[0];
    
    const queries = {
      totalConversations: `SELECT COUNT(DISTINCT session_id) as count FROM conversations WHERE DATE(timestamp) = '${today}'`,
      totalMessages: `SELECT COUNT(*) as count FROM conversations WHERE DATE(timestamp) = '${today}'`,
      escalationRate: `SELECT (COUNT(CASE WHEN escalated = 1 THEN 1 END) * 100.0 / COUNT(*)) as rate FROM analytics WHERE DATE(timestamp) = '${today}' AND user_query IS NOT NULL`,
      avgSatisfaction: `SELECT AVG(satisfaction_score) as avg FROM analytics WHERE DATE(timestamp) = '${today}' AND satisfaction_score IS NOT NULL`
    };
    
    const results = {};
    let completed = 0;
    const total = Object.keys(queries).length;
    
    Object.entries(queries).forEach(([key, query]) => {
      db.get(query, (err, row) => {
        if (err) {
          console.error(`Error in ${key} query:`, err);
          results[key] = 0;
        } else {
          results[key] = row?.count || row?.rate || row?.avg || 0;
        }
        
        completed++;
        if (completed === total) {
          resolve({
            totalConversations: Math.round(results.totalConversations),
            totalMessages: Math.round(results.totalMessages),
            escalationRate: Math.round(results.escalationRate || 0),
            avgSatisfaction: (results.avgSatisfaction || 0).toFixed(1)
          });
        }
      });
    });
  });
}

async function cleanupOldData(db, cutoffDate) {
  return new Promise((resolve, reject) => {
    const cutoffTimestamp = cutoffDate.toISOString();
    
    db.serialize(() => {
      db.run("DELETE FROM conversations WHERE timestamp < ?", [cutoffTimestamp]);
      db.run("DELETE FROM analytics WHERE timestamp < ?", [cutoffTimestamp], function(err) {
        if (err) {
          reject(err);
        } else {
          console.log(`Cleaned up ${this.changes} old analytics records`);
          resolve();
        }
      });
    });
  });
}