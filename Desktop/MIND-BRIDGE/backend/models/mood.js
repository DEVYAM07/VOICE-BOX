import mongoose from 'mongoose';

const moodSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mood: {
        type: String,
        enum: ['good', 'neutral', 'bad', 'Not Added'],
        default: 'Not Added'
    },
    visibility: {
        type: String,
        enum: ['public', 'private', 'circles'],
        default: 'private'
    },
    date: { type: String, required: true }
});

const Mood = mongoose.model('Mood', moodSchema);

export default Mood;