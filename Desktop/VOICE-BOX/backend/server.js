import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// ✅ Check this import path! Ensure your file is actually named 'model.js' in the 'models' folder.
// If you renamed it to 'Feedback.js' earlier, update this line.
import Feedback from "./models/model.js";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 1. GET ALL FEEDBACK (Handles Sorting & Searching)
app.get("/api/feedback", async (req, res) => {
    try {
        const { sort, search } = req.query;

        // A. Search Filter
        let query = {};
        if (search) {
            // $regex allows matching part of the word (case-insensitive)
            query.message = { $regex: search, $options: "i" };
        }

        // B. Sorting Logic
        let sortOption = { createdAt: -1 }; // Default: Newest first ("Recent")

        if (sort === "trending") {
            // Sort by Upvotes (Highest first), then Date
            sortOption = { upvotes: -1, createdAt: -1 };
        }

        // Fetch from DB
        const feedbacks = await Feedback.find(query).sort(sortOption);

        res.json(feedbacks);

    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// 2. POST FEEDBACK (Create New)
app.post("/api/feedback", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ success: false, error: "Message required" });
        }

        const newFeedback = await Feedback.create({ message });

        return res.json({ success: true, data: newFeedback });

    } catch (error) {
        console.log("Error saving feedback:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
});

// 3. PUT FEEDBACK (Handle Upvotes)
app.put("/api/feedback/:id/upvote", async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // Expects "increment" or "decrement"

        const change = action === "increment" ? 1 : -1;

        // Find the specific feedback by ID and add/subtract 1 from upvotes
        const updatedFeedback = await Feedback.findByIdAndUpdate(
            id,
            { $inc: { upvotes: change } },
            { new: true } // Returns the updated version so frontend stays in sync
        );

        if (!updatedFeedback) {
            return res.status(404).json({ success: false, error: "Feedback not found" });
        }

        res.json(updatedFeedback);

    } catch (error) {
        console.error("Error updating upvote:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Unexpected Error:", err.stack || err);
    res.status(500).json({ success: false, error: "Something went wrong!" });
});

// Start server after DB connection
const PORT = process.env.PORT || 5001;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err);
    }
};

startServer();



