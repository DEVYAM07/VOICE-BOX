import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/upload.js";
import moodRoutes from "./routes/mood.js";
import circleRoutes from "./routes/circles.js";
import postRoutes from "./routes/post.js";
import jwt from "jsonwebtoken";
import http from "http";
import { Server } from "socket.io";
import notificationRoutes from "./routes/notificationRoutes.js";
import journalRoutes from "./routes/journal.js";



dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);


const PORT = process.env.PORT || 5001;


app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());



const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true
    }
})

app.set("socketio", io);


io.engine.use(cookieParser());


// --- ROUTES ---
app.use("/api/auth", authRoutes);

app.use("/api/upload", uploadRoutes);

app.use('/api/mood', moodRoutes);

app.use('/api/circles', circleRoutes);

app.use('/api/posts', postRoutes);

app.use('/api/notifications', notificationRoutes);

app.use('/api/journals', journalRoutes);

app.get("/", (req, res) => {
    res.send("Mindful Server is floating... 🍃");
});

app.get("/health", (req, res) => {
    res.status(200).json({ status: "UP", message: "Server is healthy" });
});



io.use((socket, next) => {
    const token = socket.request.cookies.token;

    if (!token) {
        return next(new Error("Auth failed: No token"));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
    } catch (err) {
        next(new Error("Auth failed: Invalid token"));
    }

})

io.on('connection', (socket) => {
    // Note: socket.userId comes from your middleware
    console.log(`User Connected: ${socket.userId}`);

    // 1. PERSONAL ROOM (New): For private notifications
    // The user should emit this as soon as they log in / load the Dashboard
    socket.on("join_user_room", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their private notification room`);
    });

    // 2. CIRCLE ROOMS: For group posts
    socket.on("join_circle", (circleId) => {
        socket.join(circleId);
        console.log(`User ${socket.userId} joined circle: ${circleId}`);
    });

    socket.on("new_post", (data) => {
        const { circleId, post } = data;
        // Sends to everyone in the circle except sender
        socket.to(circleId).emit("post_received", post);
    });

    socket.on("leave_circle", (circleId) => {
        socket.leave(circleId);
        console.log(`User ${socket.userId} left circle: ${circleId}`);
    });

    socket.on("disconnect", () => {
        console.log(`User ${socket.userId} disconnected`);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});




