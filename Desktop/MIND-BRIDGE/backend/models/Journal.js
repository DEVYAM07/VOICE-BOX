import mongoose from 'mongoose';

const JournalSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },

    visibility: {
        type: String,
        enum: ['private', 'circles', 'public'],
        default: 'private'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Journal = mongoose.model('Journal', JournalSchema);
export default Journal;
