import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

export const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

export const createDefaultAdmin = async (db) => {
  return new Promise((resolve, reject) => {
    // Check if admin user exists
    db.get("SELECT * FROM users WHERE email = ?", ['admin@businessbot.com'], async (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (!row) {
        // Create default admin user
        const hashedPassword = await hashPassword('admin123');
        db.run(
          "INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)",
          ['admin@businessbot.com', hashedPassword, 'admin', 'Admin User'],
          function(err) {
            if (err) {
              reject(err);
            } else {
              console.log('Default admin user created: admin@businessbot.com / admin123');
              resolve();
            }
          }
        );
      } else {
        resolve();
      }
    });
  });
};