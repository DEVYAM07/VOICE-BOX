import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    circle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Circle',
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, "Post title is required"],
        trim: true,
        maxlength: 150
    },
    body: {
        type: String,
        required: [true, "Post content is required"],
        trim: true
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true // This automatically gives us 'createdAt' and 'updatedAt'
});


const Post = mongoose.model('Post', postSchema);
export default Post;








