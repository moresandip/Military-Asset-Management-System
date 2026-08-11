import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middlewares/authMiddleware.js';
import { logAuditEvent } from '../middlewares/loggerMiddleware.js';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Password incorrect.' });
    }

    // Fetch base info if assigned
    let base = null;
    if (user.base_id) {
      base = db.prepare('SELECT id, name, location, code FROM bases WHERE id = ?').get(user.base_id);
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      baseId: user.base_id,
      fullName: user.full_name,
      rank: user.rank,
      baseName: base ? base.name : 'All Bases (Global)'
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    logAuditEvent(user.id, 'AUTH_LOGIN', `User ${user.username} (${user.role}) logged in successfully.`);

    return res.status(200).json({
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        baseId: user.base_id,
        baseName: base ? base.name : 'All Bases (Global)',
        fullName: user.full_name,
        rank: user.rank
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error: ' + err.message });
  }
};

export const getMe = (req, res) => {
  try {
    const user = db.prepare('SELECT id, username, role, base_id, full_name, rank FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let base = null;
    if (user.base_id) {
      base = db.prepare('SELECT id, name, location, code FROM bases WHERE id = ?').get(user.base_id);
    }

    return res.status(200).json({
      ...user,
      baseName: base ? base.name : 'All Bases (Global)'
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllUsers = (req, res) => {
  try {
    const users = db.prepare(`
      SELECT u.id, u.username, u.role, u.full_name, u.rank, u.base_id, b.name as base_name
      FROM users u
      LEFT JOIN bases b ON u.base_id = b.id
    `).all();
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
