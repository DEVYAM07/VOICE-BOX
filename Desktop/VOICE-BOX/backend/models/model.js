import mongoose from "mongoose";

const modelSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
        maxlength: 500
    },


    upvotes: {
        type: Number,
        default: 0
    },

    timestamp: {
        type: Date,
        default: Date.now,
    }
});

const Feedback = mongoose.model('Feedback', modelSchema);

export default Feedback;




