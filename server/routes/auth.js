import express from 'express';
import { hashPassword, comparePassword, generateToken, verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  req.db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await comparePassword(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(user.id);
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  });
});

// Get current user
router.get('/me', verifyToken, (req, res) => {
  req.db.get("SELECT id, email, name, role FROM users WHERE id = ?", [req.user.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  });
});

// Change password
router.post('/change-password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  req.db.get("SELECT * FROM users WHERE id = ?", [req.user.userId], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    const isValidPassword = await comparePassword(currentPassword, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    const hashedNewPassword = await hashPassword(newPassword);
    
    req.db.run(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedNewPassword, req.user.userId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update password' });
        }
        
        res.json({ success: true, message: 'Password updated successfully' });
      }
    );
  });
});

export default router;