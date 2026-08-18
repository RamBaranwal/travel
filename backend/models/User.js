const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  preferences: {
    dietary: [String],
    comfortLevel: { type: String, enum: ['budget', 'standard', 'luxury'], default: 'standard' },
  },
  savedTrips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
