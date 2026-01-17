import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import { authMiddleware } from '../middleware/authMiddleware.js';

dotenv.config();

const router = express.Router();

const oAuth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- SIGNUP ROUTE ---
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({ message: "Account already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Create User (hashing happens in User.js model)
        const user = await User.create({ name, email, password: hashedPassword, isProfileSetup: false, googleid: null });

        // 3. Generate Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // 4. Store token in HTTP-Only Cookie
        res.cookie('token', token, {
            httpOnly: true,     // Prevents JS from accessing the cookie
            secure: false,
            sameSite: 'lax',    // CSRF protection
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // 5. Send final response
        res.status(201).json({
            message: "Welcome to Mindful!",
        });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Signup failed", error: error.message });
    }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 2. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 3. Generate Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // 4. Store token in HTTP-Only Cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // 5. Send final response
        res.status(200).json({
            message: "Welcome back!"
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Login failed", error: error.message, user: user });
    }
});

router.post('/google', async (req, res) => {
    try {
        const { tokenId } = req.body;

        if (!tokenId) {
            return res.status(400).json({ message: "Token ID is required" });
        }

        const ticket = await oAuth2Client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, sub: googleid } = payload;

        let user = await User.findOne({ googleid });
        if (!user) {
            user = await User.findOne({ email });
        }


        if (!user) {
            user = await User.create({
                name,
                email,
                googleid,
                isProfileSetup: false
            });
        }
        else if (!user.googleid) {
            user.googleid = googleid;
            await user.save();
        }
        else if (user.email !== email) {
            user.email = email;
            await user.save();
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Google login successful",
            isProfileSetup: user.isProfileSetup,// Only sending the flag
            user: user
        });



    }

    catch (error) {
        console.error("Google Login Error:", error);
        res.status(500).json({ message: "Google login failed" });


    }




})



router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/'
    }
    );
    res.status(200).json({ message: "Logout successful" });



})


router.get('/me', authMiddleware, async (req, res) => {
    try {
        const userId = req.userid;
        const user = await User.findById(userId).select('-password -googleid -__v');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ success: true, user });

    } catch (error) {
        console.error("Fetch User Error:", error);
        res.status(500).json({ message: "Failed to fetch user data" });
    }
}
)

export default router;