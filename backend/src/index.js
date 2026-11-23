import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDatabase, pool } from './db.js';
import inventoryRoutes from './routes/inventory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());

// Health check endpoint (cocok untuk Coolify health check)
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      message: error.message,
    });
  }
});

app.use('/api/inventory', inventoryRoutes);

// Serve static frontend build in production (Docker / Coolify)
const publicDir = path.resolve(__dirname, '../public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

async function startServer() {
  const maxRetries = 10;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await initDatabase();
      console.log('[DB] PostgreSQL connected & schema ready.');
      break;
    } catch (error) {
      console.warn(
        `[DB] Connection attempt ${attempt}/${maxRetries} failed: ${error.message}`
      );
      if (attempt === maxRetries) {
        console.error('[DB] Could not connect to PostgreSQL. Starting server in degraded mode.');
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] KafeStock API running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
