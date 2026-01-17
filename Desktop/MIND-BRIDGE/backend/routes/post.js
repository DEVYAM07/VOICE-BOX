import express from "express";
import Post from "../models/Post.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import Notification from "../models/Notification.js";

const router = express.Router();



router.get('/circle/:circleId', authMiddleware, async (req, res) => {

    try {
        const { circleId } = req.params;


        const posts = await Post.find({ circle: circleId })
            .populate('author', 'displayName avatarUrl')
            .populate('comments.user', 'displayName avatarUrl')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            posts
        });


    }
    catch (error) {
        console.error("Error fetching circle feed:", error);
        res.status(500).json({ message: "Server error fetching posts" });

    }


}
)


router.post('/', authMiddleware, async (req, res) => {

    try {
        const { title, body, circleId } = req.body;

        // 1. Validation
        if (!title || !body || !circleId) {
            return res.status(400).json({ message: "Please provide title, body, and circleId" });
        }

        // 2. Create Post

        const newPost = await Post.create({
            title,
            body,
            circle: circleId,
            author: req.userid
        });

        const populatedPost = await Post.findById(newPost._id)
            .populate('author', 'displayName avatarUrl');

        res.status(201).json({
            success: true,
            post: populatedPost
        });


    }
    catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: "Internal server error while posting" });


    }



}
)




router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { title, body } = req.body;

        // 1. Find the post
        let post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // 2. Security: Check if user owns the post
        // post.author is an ObjectId, req.userid is a string
        if (post.author.toString() !== req.userid) {
            return res.status(401).json({ message: "Not authorized to edit this post" });
        }

        // 3. Update fields
        post.title = title || post.title;
        post.body = body || post.body;

        await post.save();

        // 4. Return populated post so UI keeps author details
        const updatedPost = await Post.findById(post._id).populate('author', 'displayName avatarUrl');

        res.json({ success: true, post: updatedPost });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});


router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Security check
        if (post.author.toString() !== req.userid) {
            return res.status(401).json({ message: "Not authorized to delete this post" });
        }

        await post.deleteOne();

        res.json({ success: true, message: "Post removed" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});




router.post('/:id/comment', authMiddleware, async (req, res) => {
    try {
        const { text } = req.body;

        // Use findByIdAndUpdate to push the comment using the 'user' field
        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    comments: {
                        text,
                        user: req.userid, // ensure your authMiddleware sets req.userid
                        createdAt: new Date()
                    }
                }
            },
            { new: true }
        ).populate('comments.user', 'displayName avatarUrl'); // Added avatarUrl here

        if (!updatedPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (updatedPost.author.toString() !== req.userid) {

            // A. Save the notification to MongoDB
            const newNotif = await Notification.create({
                recipient: updatedPost.author,    // The person who gets the red dot
                sender: req.userid,        // The person who commented
                circleId: updatedPost.circle,     // Needed for navigation later
                postId: updatedPost._id,          // Needed for navigation later
                text: `commented on your post: "${updatedPost.title}"`
            });

            // B. Populate sender details so the frontend gets the name/avatar immediately
            const populatedNotif = await newNotif.populate('sender', 'displayName avatarUrl');

            // C. Emit via Socket
            const io = req.app.get('socketio');
            // We send it to a "room" named after the author's ID
            io.to(updatedPost.author.toString()).emit("new_notification", populatedNotif);
        }

        res.json({ success: true, comments: updatedPost.comments });
    } catch (err) {
        console.error("Backend Comment Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;