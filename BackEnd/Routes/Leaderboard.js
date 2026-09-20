import express from 'express';
import { getLeaderboard, getLeaderboardSummary, triggerRecalculateRanks } from '../Controllers/LeaderboardCn.js';
import isAdmin from '../Middlewares/isAdmin.js';

const leaderboardRouter = express.Router();

// Public / Authenticated Leaderboard Endpoints
leaderboardRouter.get('/', getLeaderboard);
leaderboardRouter.get('/summary', getLeaderboardSummary);
leaderboardRouter.get('/meta', getLeaderboardSummary);

// Admin-only rank recalculation trigger
leaderboardRouter.post('/recalculate-ranks', isAdmin, triggerRecalculateRanks);

export default leaderboardRouter;
