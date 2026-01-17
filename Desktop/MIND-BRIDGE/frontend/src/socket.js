import { io } from "socket.io-client";


// Create the socket instance with auto-connect disabled initially
// This gives you control over when the connection starts
export const socket = io("http://localhost:5001", {
    withCredentials: true,
    autoConnect: false,
});

// Helper functions to manage the connection
export const connectSocket = () => {
    if (!socket.connected) {
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};
