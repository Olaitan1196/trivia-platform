import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import categoryFeeRoutes from './routes/categoryFeeRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import quizSessionRoutes from './routes/quizSessionRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import stageRoutes from './routes/stageRoutes.js';
import eventParticipantRoutes from './routes/eventParticipantRoutes.js';
import settingRoutes from './routes/settingRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/category-fee', categoryFeeRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/quizsessions', quizSessionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/stages', stageRoutes);
app.use('/api/event-participants', eventParticipantRoutes);
app.use('/api/settings', settingRoutes);

app.get('/', (req, res) => {
  res.send('Trivia Platform Backend is Running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});