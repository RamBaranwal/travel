const mongoose = require('mongoose');

const predefinedPackageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  destination: { type: String, required: true },
  durationDays: { type: Number, required: true },
  comfortTier: { type: String, enum: ['budget', 'standard', 'luxury'], required: true },
  baselineCost: { type: Number, required: true },
  itinerary: [{
    day: Number,
    activities: [String]
  }],
  includedItems: [String],
  image: String
}, { timestamps: true });

module.exports = mongoose.model('PredefinedPackage', predefinedPackageSchema);
