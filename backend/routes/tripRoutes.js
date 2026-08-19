const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

router.post('/calculate', tripController.calculateTrip);
router.post('/save', tripController.saveTrip);
router.get('/catalog', tripController.getDestinationCatalog);
router.get('/packages', tripController.getPackages);

module.exports = router;