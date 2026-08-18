import { useState, useEffect } from 'react';
import { Target, Search, Loader2 } from 'lucide-react';

export default function FixBudgetTrip({ tripState, setTripState, setTradeOffs }) {
  const [loading, setLoading] = useState(false);
  const [localBudget, setLocalBudget] = useState(tripState.budgetCap);
  
  // Mock generation of a trip based on budget
  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      // Base costs
      const flightBaseCost = 600;
      const hotelBaseCost = 200;

      const generatedItems = [
        { type: 'transport', category: 'transport', name: 'Roundtrip Flight', cost: flightBaseCost },
        { type: 'accommodation', category: 'accommodation', name: 'Luxury Resort & Spa', cost: hotelBaseCost }
      ];
      
      const total = (flightBaseCost * tripState.travelers) + (hotelBaseCost * tripState.totalDays);
      
      setTripState(prev => ({
        ...prev,
        budgetCap: localBudget,
        items: generatedItems
        // totalCost is recalculated automatically in Dashboard
      }));

      if (total > localBudget) {
        // Trigger mock trade-offs with dynamic savings
        setTradeOffs([
          {
            type: 'trade-off',
            category: 'accommodation',
            originalItem: 'Luxury Resort & Spa',
            suggestedItem: 'Boutique City Hotel',
            originalCost: hotelBaseCost,
            suggestedCost: 100,
            savings: (hotelBaseCost - 100) * tripState.totalDays
          },
          {
            type: 'trade-off',
            category: 'accommodation',
            originalItem: 'Luxury Resort & Spa',
            suggestedItem: 'Traditional Ryokan',
            originalCost: hotelBaseCost,
            suggestedCost: 150,
            savings: (hotelBaseCost - 150) * tripState.totalDays
          }
        ]);
      } else {
        setTradeOffs([]);
      }

      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-lg mx-auto">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Target className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Fix Your Trip</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Enter your strict budget cap. We'll automatically build an itinerary that fits, or suggest smart trade-offs.
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Maximum Budget Cap ($)</label>
          <input 
            type="number"
            value={localBudget}
            onChange={(e) => setLocalBudget(Number(e.target.value))}
            className="w-full text-2xl font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Destination</label>
          <input 
            type="text"
            value={tripState.destination}
            onChange={(e) => setTripState(prev => ({...prev, destination: e.target.value}))}
            className="w-full font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>

        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          {loading ? 'Crunching Numbers...' : 'Auto-Generate Trip'}
        </button>
      </div>
      
      {tripState.items.length > 0 && !loading && (
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold mb-4">Generated Itinerary Items</h3>
          <div className="space-y-3">
            {tripState.items.map((item, idx) => (
              <div key={item.id || item._id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
                <div>
                  <div className="font-semibold text-sm">{item.name}</div>
                  <div className="text-xs text-slate-500 capitalize">{item.type || item.category}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">${(item.cost || item.estimatedCost || 0).toFixed(2)}</div>
                  <button 
                    onClick={() => handleToggle(item)}
                    className="mt-1 text-red-500 hover:text-red-700 text-[10px] font-bold uppercase tracking-wider flex items-center justify-end gap-1"
                  >
                    <Trash2 className="w-3 h-3"/> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
