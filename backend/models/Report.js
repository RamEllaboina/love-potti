const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    category: { type: String, required: true },
    confidence: { type: Number, required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    address: { type: String, default: 'Unknown Location' },
    imageUrl: { type: String, required: true },
    description: { type: String, default: "" }, // Not strictly required but useful
    status: { type: String, enum: ['not_solved', 'in_progress', 'solved'], default: 'not_solved' },
    upvotes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Report', reportSchema);
