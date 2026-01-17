import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,

    },
    password: {
        type: String
    },
    googleid: {
        type: String,
        unique: true,
        sparse: true
    },
    isProfileSetup: {
        type: Boolean,
        default: false
    },
    displayName: {
        type: String,
        default: '',
        unique: true
    },
    bio: {
        type: String,
        default: ''
    },
    interests: {
        type: [String],
        default: []
    },
    avatarUrl: {
        type: String,
        default: ''
    }


})

const User = mongoose.model('User', schema);
export default User;
