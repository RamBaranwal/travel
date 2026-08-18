const Trip = require('../models/Trip');
const { evaluateBudget } = require('../services/budgetGuardrailService');
const DestinationCatalog = require('../models/DestinationCatalog');
const PredefinedPackage = require('../models/PredefinedPackage');

exports.calculateTrip = async (req, res) => {
  try {
    const { items, budgetCap, destination, travelers = 1, totalDays = 1 } = req.body;
    
    if (!items || !budgetCap || !destination) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const evaluation = await evaluateBudget(items, budgetCap, destination, travelers, totalDays);
    res.json(evaluation);
  } catch (error) {
    res.status(500).json({ message: 'Error calculating trip', error: error.message });
  }
};

exports.saveTrip = async (req, res) => {
  try {
    const trip = new Trip({
      ...req.body,
      userId: req.body.userId || '60d0fe4f5311236168a109ca' // Mock user ID for now
    });
    const savedTrip = await trip.save();
    res.status(201).json(savedTrip);
  } catch (error) {
    res.status(500).json({ message: 'Error saving trip', error: error.message });
  }
};

exports.getDestinationCatalog = async (req, res) => {
  try {
    const { destination } = req.query;
    const filter = destination ? { location: destination } : {};
    const items = await DestinationCatalog.find(filter);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching catalog', error: error.message });
  }
};

exports.getPackages = async (req, res) => {
  try {
    const packages = await PredefinedPackage.find();
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching packages', error: error.message });
  }
};
