import { Request, Response } from 'express';
import { Admin } from '../models/Admin';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const adminController = {
  // Login admin
  login: async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      const admin = await Admin.findOne({ username });
      if (!admin) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: admin._id, username: admin.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error });
    }
  },

  // Verify token
  verifyToken: async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      res.json({ valid: true, user: decoded });
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  },

  // Initialize admin (use this once to create the first admin account)
  initializeAdmin: async (req: Request, res: Response) => {
    try {
      const adminExists = await Admin.findOne();
      if (adminExists) {
        return res.status(400).json({ message: 'Admin already initialized' });
      }

      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new Admin({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com'
      });

      await admin.save();
      res.status(201).json({ message: 'Admin initialized successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error initializing admin', error });
    }
  }
};