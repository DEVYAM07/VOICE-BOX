import express from 'express';
import cloudinary from '../config/cloudinary.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// 1. GET SIGNATURE
router.get('/get-signature', authMiddleware, (req, res) => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'mindbridge_avatars';

    const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder },
        process.env.CLOUDINARY_API_SECRET
    );

    res.json({
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder
    });
});

// 2. COMPLETE SETUP
router.patch('/complete-setup', authMiddleware, async (req, res) => {
    try {
        const { displayName, bio, interests, avatarUrl } = req.body;

        if (!displayName) {
            return res.status(400).json({ message: "Display name is required" });
        }

        const userId = req.userid; // Set by authMiddleware

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                displayName,
                bio,
                interests,
                avatarUrl: avatarUrl,
                isProfileSetup: true
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ success: true, user: updatedUser });

    } catch (err) {
        console.error("Update Error:", err.message);
        res.status(500).json({ success: false, message: "Failed to update profile" });
    }
});

export default router;