const DestinationCatalog = require('../models/DestinationCatalog');

/**
 * Evaluates the trip cost against the budget cap.
 * If over budget, returns top 3 trade-off suggestions.
 *
 * @param {Array} items - Selected trip items (transport, stay, etc.)
 * @param {Number} budgetCap - The strict budget limit
 * @param {String} destination - The trip destination
 * @param {Number} travelers - Number of travelers
 * @param {Number} totalDays - Number of trip days
 * @returns {Object} { isOverBudget: Boolean, totalCost: Number, suggestions: Array }
 */
async function evaluateBudget(items, budgetCap, destination, travelers = 1, totalDays = 1) {
  let totalCost = 0;
  
  // Calculate total cost
  items.forEach(item => {
    let multiplier = 1;
    if (item.category === 'transport' || item.category === 'package' || item.category === 'activity') {
      multiplier = travelers;
    } else if (item.category === 'accommodation') {
      multiplier = totalDays;
    }
    // Handle both 'category' and 'type' for fallback since some mock items use 'type'
    if (!item.category && item.type) {
      if (item.type === 'transport' || item.type === 'activity') multiplier = travelers;
      if (item.type === 'accommodation') multiplier = totalDays;
    }
    totalCost += item.cost * multiplier;
  });

  if (totalCost <= budgetCap) {
    return { isOverBudget: false, totalCost, suggestions: [] };
  }

  // We are over budget. Find trade-off suggestions.
  const overage = totalCost - budgetCap;
  let suggestions = [];

  // Look for accommodations to downgrade as the primary trade-off
  const currentHotels = items.filter(i => i.category === 'accommodation' || i.type === 'accommodation');
  
  for (const hotel of currentHotels) {
    // Find cheaper alternatives in the destination
    const alternatives = await DestinationCatalog.find({
      location: destination,
      category: 'accommodation',
      estimatedCost: { $lt: hotel.cost }
    }).sort({ estimatedCost: -1 }).limit(5); // Get closest cheaper alternatives

    alternatives.forEach(alt => {
      const savings = (hotel.cost - alt.estimatedCost) * totalDays;
      suggestions.push({
        type: 'trade-off',
        category: 'accommodation',
        originalItem: hotel.name,
        suggestedItem: alt.name,
        originalCost: hotel.cost,
        suggestedCost: alt.estimatedCost,
        savings: savings,
        message: `Swap ${hotel.name} for ${alt.name} to save $${savings.toFixed(2)}`
      });
    });
  }

  // Look for cheaper transport alternatives
  const currentTransports = items.filter(i => i.category === 'transport' || i.type === 'transport');
  for (const transport of currentTransports) {
    const alternatives = await DestinationCatalog.find({
      location: destination,
      category: 'transport',
      estimatedCost: { $lt: transport.cost }
    }).sort({ estimatedCost: -1 }).limit(5);

    alternatives.forEach(alt => {
      const savings = (transport.cost - alt.estimatedCost) * travelers;
      suggestions.push({
        type: 'trade-off',
        category: 'transport',
        originalItem: transport.name,
        suggestedItem: alt.name,
        originalCost: transport.cost,
        suggestedCost: alt.estimatedCost,
        savings: savings,
        message: `Swap ${transport.name} for ${alt.name} to save $${savings.toFixed(2)}`
      });
    });
  }

  // Look for cheaper food alternatives
  const currentFoods = items.filter(i => i.category === 'food' || i.category === 'local-food');
  for (const food of currentFoods) {
    const alternatives = await DestinationCatalog.find({
      location: destination,
      category: 'food',
      estimatedCost: { $lt: food.cost }
    }).sort({ estimatedCost: -1 }).limit(5);

    alternatives.forEach(alt => {
      const savings = (food.cost - alt.estimatedCost); // Food is added per instance (multiplier 1)
      suggestions.push({
        type: 'trade-off',
        category: 'food',
        originalItem: food.name,
        suggestedItem: alt.name,
        originalCost: food.cost,
        suggestedCost: alt.estimatedCost,
        savings: savings,
        message: `Swap ${food.name} for ${alt.name} to save $${savings.toFixed(2)}`
      });
    });
  }
  
  // Sort suggestions by closest to the overage amount (to minimize downgrade impact while meeting budget)
  suggestions.sort((a, b) => {
     // We want savings >= overage if possible. 
     // For simplicity, just sort by highest savings first to guarantee budget is met
     return b.savings - a.savings;
  });

  return { 
    isOverBudget: true, 
    totalCost, 
    suggestions: suggestions.slice(0, 3) // Return top 3
  };
}

module.exports = {
  evaluateBudget
};
