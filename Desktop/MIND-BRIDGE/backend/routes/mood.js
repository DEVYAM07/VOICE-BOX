import express from 'express';
import Mood from '../models/mood.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose'; // 1. Proper ES Module import

const router = express.Router();
dotenv.config();

// --- SYNC ROUTE ---
router.post('/sync', authMiddleware, async (req, res) => {
    try {
        const { mood, visibility } = req.body;
        const userId = req.userid;
        const todayStr = new Date().toDateString();

        await Mood.findOneAndUpdate(
            { userId, date: todayStr },
            { mood, visibility },
            { upsert: true, new: true }
        );

        const lastEntry = await Mood.findOne({
            userId,
            date: { $ne: todayStr }
        }).sort({ _id: -1 });

        if (lastEntry) {
            const lastDate = new Date(lastEntry.date);
            const todayDate = new Date(todayStr);
            const diffTime = Math.abs(todayDate - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 1) {
                const missingEntries = [];
                for (let i = 1; i < diffDays; i++) {
                    const fillerDate = new Date(lastDate);
                    fillerDate.setDate(lastDate.getDate() + i);
                    missingEntries.push({
                        userId,
                        mood: 'Not Added',
                        date: fillerDate.toDateString()
                    });
                }
                if (missingEntries.length > 0) {
                    await Mood.insertMany(missingEntries);
                }
            }
        }
        res.status(200).json({ message: "Mood synced successfully" });
    } catch (error) {
        console.error("Mood Sync Error:", error);
        res.status(500).json({ message: "Server error during mood sync" });
    }
});

// --- HISTORY & STATS ROUTE ---
router.get('/history', authMiddleware, async (req, res) => { // Use authMiddleware to match your app
    try {
        // 2. Correct way to create an ObjectId in ES Modules
        const userObjId = new mongoose.Types.ObjectId(req.userid);

        // 3. Fetch history using the same req.userid
        const history = await Mood.find({ userId: userObjId }).sort({ _id: -1 }).limit(30);

        // 4. Aggregate stats
        const statsData = await Mood.aggregate([
            {
                $match: {
                    userId: userObjId,
                    mood: { $in: ['good', 'neutral', 'bad'] }
                }
            },
            {
                $group: {
                    _id: "$mood",
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalEntries = await Mood.countDocuments({ userId: userObjId, mood: { $in: ['good', 'neutral', 'bad'] } });
        const stats = { good: 0, neutral: 0, bad: 0 };

        statsData.forEach(item => {
            stats[item._id] = totalEntries > 0
                ? Math.round((item.count / totalEntries) * 100)
                : 0;
        });

        res.json({ success: true, history, stats });
    } catch (err) {
        console.error("Stats Error:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;