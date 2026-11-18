
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';

import supabase from './config/supabase.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get('/', (req, res) => {
    res.send('Server Monitoring Backend is running!');
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

// Authentication routes
app.use('/api/auth', authRoutes);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
