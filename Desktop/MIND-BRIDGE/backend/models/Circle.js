import mongoose from 'mongoose';

const circleSchema = new mongoose.Schema({
    // Basic Info
    name: {
        type: String,
        required: [true, "Please provide a name for the circle"],
        trim: true,
        maxlength: [50, "Name cannot be more than 50 characters"],
        unique: true
    },
    description: {
        type: String,
        required: [true, "Please provide a description"],
        maxlength: [500, "Description cannot be more than 500 characters"]
    },

    // Tags (Dropdown selection from frontend)
    tags: [{
        type: String
    }],

    // Roles & Membership
    // Changed to an array to support multiple moderators/admins
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    memberCount: {
        type: Number,
        default: 1
    },
    requests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],

    // Privacy & Settings
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },


    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Circle = mongoose.model('Circle', circleSchema);
export default Circle;
