import dotenv from 'dotenv';
// Load environment variables from .env
dotenv.config();
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import metricRoutes from './routes/metrics.routes.js';
import deviceRoutes from './routes/devices.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Home route / Health check
app.get('/', (req, res) => {
    res.send('Server Monitoring Backend is running!');
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/metrics', metricRoutes);

// Global Error Handler Catch-all
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});