import dotenv from 'dotenv';
// Load environment variables from .env
dotenv.config();

import express from 'express';
import cors from 'cors';
import supabase from './config/supabase.js';

import metricRoutes from './routes/metrics.routes.js';
import deviceRoutes from './routes/devices.routes.js'
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Temporary database test route
app.get('/test-db', async (req, res) => {
    const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

    if (error) {
        console.error('Supabase error:', error.message);
        return res.status(500).json({
            message: 'Database connection failed'
        });
    }

    res.json({
        message: 'Supabase connection successful!'
    });
});

// Register API Routes
app.use('/api/metrics', metricRoutes);
app.use('/api/devices', deviceRoutes);

// Global Error Handler Catch-all
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Telemetry backend running on port ${PORT}`);
});