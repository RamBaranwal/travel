const mongoose = require('mongoose');

const destinationCatalogSchema = new mongoose.Schema({
  location: { type: String, required: true },
  category: { 
    type: String, 
    required: true
  },
  name: { type: String, required: true },
  description: String,
  estimatedCost: { type: Number, required: true }, // Cost per person or per unit
  rating: { type: Number, min: 1, max: 5 },
  tags: [String],
  image: String
}, { timestamps: true });

module.exports = mongoose.model('DestinationCatalog', destinationCatalogSchema);
