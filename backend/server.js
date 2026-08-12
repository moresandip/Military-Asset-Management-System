import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import { apiAuditLogger } from './middlewares/loggerMiddleware.js';
import { seedDatabase } from './config/seed.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for React development (inline scripts/styles)
}));
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// API Audit Logger Middleware
app.use(apiAuditLogger);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    system: 'Kristallball Military Asset Management Backend',
    timestamp: new Date().toISOString()
  });
});

// Manual Seed Endpoint (for first deployment on Render)
app.get('/api/seed', async (req, res) => {
  try {
    await seedDatabase();
    res.status(200).json({ message: '✅ Database seeded successfully! You can now login.' });
  } catch (err) {
    res.status(500).json({ message: 'Seed failed: ' + err.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/ops', assignmentRoutes);
app.use('/api/audit-logs', auditRoutes);

// Serve Static Frontend
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Fallback Route for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: 'Internal Server Error: ' + err.message });
});

app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`  MILITARY ASSET MANAGEMENT SYSTEM API             `);
  console.log(`  Server running on http://localhost:${PORT}        `);
  console.log(`====================================================`);

  // Auto-seed on every startup (Render filesystem is ephemeral)
  try {
    console.log('🌱 Running database seed on startup...');
    await seedDatabase();
    console.log('✅ Database ready!');
  } catch (err) {
    console.error('⚠️ Seed error:', err.message);
  }
});
