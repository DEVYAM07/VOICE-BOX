import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    circleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Circle' },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }

})

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;

