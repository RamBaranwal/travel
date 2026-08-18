const mongoose = require('mongoose');

const tripItemSchema = new mongoose.Schema({
  type: { type: String, enum: ['transport', 'accommodation', 'activity', 'food'] },
  name: String,
  cost: Number,
  provider: String,
  details: mongoose.Schema.Types.Mixed
});

const tripSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  modeType: { type: String, enum: ['fix-budget', 'free-hand', 'pre-planned'], required: true },
  startLocation: String,
  destination: String,
  startDate: Date,
  endDate: Date,
  travelerCount: { type: Number, default: 1 },
  budgetCap: Number,
  items: [tripItemSchema],
  totalCalculatedCost: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
