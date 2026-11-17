import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import metricRoutes from './routes/metricRoutes.js';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Register API Routes
app.use('/api/metrics', metricRoutes);

// Global Error Handler Catch-all
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Telemetry backend running on port ${PORT}`);
});