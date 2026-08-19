import { useState, useEffect } from 'react';
import { Target, Search, Loader2, Trash2, Car, BedDouble, Utensils, MapIcon, AlertTriangle } from 'lucide-react';

export default function FixBudgetTrip({ tripState, setTripState, setTradeOffs }) {
  const [loading, setLoading] = useState(false);
  const [localBudget, setLocalBudget] = useState(tripState.budgetCap);
  
  const [lowBudgetWarning, setLowBudgetWarning] = useState(false);
  const [fullCatalog, setFullCatalog] = useState({ accommodations: [], transports: [], foods: [], places: [] });
  
  const handleToggle = (itemToRemove) => {
    setTripState(prev => ({
      ...prev,
      items: prev.items.filter(item => (item.id || item._id) !== (itemToRemove.id || itemToRemove._id))
    }));
  };

  const handleItemChange = (day, category, newName, oldId) => {
    const arr = category === 'accommodation' ? fullCatalog.accommodations : fullCatalog.foods;
    const newItemData = arr.find(i => i.name === newName);
    if (!newItemData) return;
    
    setTripState(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if ((item.id === oldId || item._id === oldId)) {
          return {
            ...item,
            name: newItemData.name,
            cost: newItemData.estimatedCost || newItemData.cost || 0
          };
        }
        return item;
      })
    }));
  };

  const handleGenerate = async () => {
    if (!tripState.destination) {
      alert("Please enter a destination");
      return;
    }
    
    setLoading(true);
    setLowBudgetWarning(false);
    try {
      let res;
      let catalog;
      try {
        res = await fetch(`/api/trips/catalog?destination=${encodeURIComponent(tripState.destination)}`);
        if (!res.ok) throw new Error("Backend not available");
        catalog = await res.json();
      } catch (e) {
        // Mock fallback for static deployment
        catalog = [
          { _id: '1', category: 'transport', name: 'Standard Flight/Train', cost: 150 },
          { _id: '2', category: 'accommodation', name: '3-Star Hotel', cost: 120 },
          { _id: '3', category: 'food', name: 'Local Dining', cost: 40 },
          { _id: '4', category: 'place-to-visit', name: 'City Tour', cost: 25 }
        ];
      }
      
      const sortByPrice = (arr) => arr.sort((a, b) => (a.estimatedCost || a.cost || 0) - (b.estimatedCost || b.cost || 0));
      
      const accommodations = sortByPrice(catalog.filter(i => i.category === 'accommodation'));
      const transports = sortByPrice(catalog.filter(i => i.category === 'transport'));
      const foods = sortByPrice(catalog.filter(i => i.category === 'food' || i.category === 'local-food'));
      const places = sortByPrice(catalog.filter(i => i.category === 'place-to-visit'));
      
      setFullCatalog({ accommodations, transports, foods, places });
      
      let generatedItems = [];
      const totalDays = tripState.totalDays || 1;
      
      const cheapestTransport = transports.length > 0 ? (transports[0].estimatedCost || transports[0].cost || 0) : 0;
      const cheapestAcc = accommodations.length > 0 ? (accommodations[0].estimatedCost || accommodations[0].cost || 0) : 0;
      const cheapestFood = foods.length > 0 ? (foods[0].estimatedCost || foods[0].cost || 0) : 0;
      const baselineCost = cheapestTransport + ((cheapestAcc + cheapestFood) * totalDays);
      
      setLowBudgetWarning(localBudget < baselineCost);
      
      // STRICT BUDGET PROPORTIONAL MATCHING
      const availableBudgetForDays = Math.max(0, localBudget - cheapestTransport);
      const targetDailyBudget = availableBudgetForDays / totalDays;
      
      let currentTotalCost = 0;
      
      // 1. Automatically subtract and add the cheapest foundation transport
      if (transports.length > 0) {
        const trans = transports[0];
        const tCost = trans.estimatedCost || trans.cost || 0;
        generatedItems.push({
          id: `gen-trans-${Date.now()}`,
          category: 'transport',
          name: trans.name,
          cost: tCost
        });
        currentTotalCost += tCost;
      }
      
      // 2. Select items for each day that fit within the strict target daily budget
      for (let day = 1; day <= totalDays; day++) {
        let bestAcc = accommodations.length > 0 ? accommodations[0] : null;
        let bestFood = foods.length > 0 ? foods[0] : null;
        
        // Find best accommodation that fits within ~70% of the daily budget
        if (accommodations.length > 0) {
           for (let i = accommodations.length - 1; i >= 0; i--) {
               const cost = accommodations[i].estimatedCost || accommodations[i].cost || 0;
               if (cost <= targetDailyBudget * 0.7) {
                   bestAcc = accommodations[i];
                   break;
               }
           }
        }
        
        // Find best food that fits within the remaining daily budget
        if (foods.length > 0) {
           const remaining = targetDailyBudget - (bestAcc ? (bestAcc.estimatedCost || bestAcc.cost || 0) : 0);
           for (let i = foods.length - 1; i >= 0; i--) {
               const cost = foods[i].estimatedCost || foods[i].cost || 0;
               if (cost <= remaining) {
                   bestFood = foods[i];
                   break;
               }
           }
        }
        
        if (bestAcc) {
            const aCost = bestAcc.estimatedCost || bestAcc.cost || 0;
            generatedItems.push({
                id: `gen-acc-${day}-${Date.now()}`,
                category: 'accommodation',
                name: bestAcc.name,
                cost: aCost,
                day
            });
            currentTotalCost += aCost;
        }
        
        if (bestFood) {
            const fCost = bestFood.estimatedCost || bestFood.cost || 0;
            generatedItems.push({
                id: `gen-food-${day}-${Date.now()}`,
                category: 'food',
                name: bestFood.name,
                cost: fCost,
                day
            });
            currentTotalCost += fCost;
        }
        
        if (places.length > 0) {
          for (let i = 0; i < 2; i++) {
            let pIndex = (day * 2 + i) % places.length;
            if (localBudget < baselineCost * 1.5) {
               pIndex = Math.min(i, places.length - 1);
            }
            const place = places[pIndex];
            const pCost = place.estimatedCost || place.cost || 0;
            generatedItems.push({
              id: `gen-place-${day}-${i}-${Date.now()}`,
              category: 'place-to-visit',
              name: place.name,
              cost: pCost,
              day
            });
            currentTotalCost += pCost;
          }
        }
      }
      
      setTripState(prev => ({
        ...prev,
        budgetCap: localBudget,
        items: generatedItems
      }));
      
      let calcRes;
      let calcData;
      try {
        calcRes = await fetch('/api/trips/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: generatedItems,
            budgetCap: localBudget,
            destination: tripState.destination,
            travelers: tripState.travelers || 1,
            totalDays: totalDays
          })
        });
        if (!calcRes.ok) throw new Error("Backend not available");
        calcData = await calcRes.json();
      } catch (e) {
        // Mock fallback for static deployment
        calcData = { isOverBudget: localBudget < currentTotalCost, suggestions: [] };
      }
      
      if (calcData.isOverBudget && calcData.suggestions && calcData.suggestions.length > 0) {
        setTradeOffs(calcData.suggestions);
      } else {
        setTradeOffs([]);
      }
      
    } catch (error) {
      console.error("Error generating trip:", error);
    } finally {
      setLoading(false);
    }
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
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-6">
          <h3 className="font-bold text-xl mb-2">Generated Day-by-Day Itinerary</h3>
          
          {lowBudgetWarning && (
            <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm mb-1">Tight Budget Alert</div>
                <div className="text-xs">Your budget cap is lower than the minimum estimated cost for this destination. We have automatically selected the most budget-friendly options available.</div>
              </div>
            </div>
          )}

          {/* Foundation Transport */}
          {tripState.items.filter(i => i.category === 'transport').map(transport => (
            <div key={transport.id} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0.5">Foundation Transport</div>
                  <div className="font-bold text-base">{transport.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">${(transport.cost || transport.estimatedCost || 0).toFixed(2)}</div>
                <button onClick={() => handleToggle(transport)} className="mt-1 text-red-500 hover:text-red-700 text-[10px] font-bold uppercase tracking-wider flex items-center justify-end gap-1 ml-auto">
                  <Trash2 className="w-3 h-3"/> Remove
                </button>
              </div>
            </div>
          ))}

          {/* Day Cards */}
          {Array.from({ length: tripState.totalDays || 1 }, (_, i) => i + 1).map(day => {
            const dayItems = tripState.items.filter(item => item.day === day);
            if (dayItems.length === 0) return null;
            
            const hotel = dayItems.find(i => i.category === 'accommodation');
            const food = dayItems.filter(i => i.category === 'food' || i.category === 'local-food');
            const places = dayItems.filter(i => i.category === 'place-to-visit');
            
            return (
              <div key={`day-${day}`} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
                <h4 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">
                    {day}
                  </span>
                  Day {day} Schedule
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Hotel Stay */}
                  {hotel && (
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-1"><BedDouble className="w-3 h-3" /> Hotel Stay</div>
                      <div className="flex justify-between items-start">
                        <select 
                          className="font-semibold text-sm bg-transparent outline-none w-full text-slate-800 dark:text-slate-200"
                          value={hotel.name}
                          onChange={(e) => handleItemChange(day, 'accommodation', e.target.value, hotel.id || hotel._id)}
                        >
                          {fullCatalog.accommodations.map(opt => (
                            <option key={opt._id} value={opt.name}>{opt.name}</option>
                          ))}
                        </select>
                        <div className="text-right shrink-0 ml-2">
                          <div className="font-bold text-sm">${(hotel.cost || hotel.estimatedCost || 0).toFixed(2)}</div>
                          <button onClick={() => handleToggle(hotel)} className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase flex items-center gap-1 justify-end w-full mt-1">
                            <Trash2 className="w-3 h-3"/>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Dining / Food */}
                  {food.map(f => (
                    <div key={f.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <div className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Utensils className="w-3 h-3" /> Dining / Food</div>
                      <div className="flex justify-between items-start">
                        <select 
                          className="font-semibold text-sm bg-transparent outline-none w-full text-slate-800 dark:text-slate-200"
                          value={f.name}
                          onChange={(e) => handleItemChange(day, 'food', e.target.value, f.id || f._id)}
                        >
                          {fullCatalog.foods.map(opt => (
                            <option key={opt._id} value={opt.name}>{opt.name}</option>
                          ))}
                        </select>
                        <div className="text-right shrink-0 ml-2">
                          <div className="font-bold text-sm">${(f.cost || f.estimatedCost || 0).toFixed(2)}</div>
                          <button onClick={() => handleToggle(f)} className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase flex items-center gap-1 justify-end w-full mt-1">
                            <Trash2 className="w-3 h-3"/>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Attractions / Places */}
                {places.length > 0 && (
                  <div className="pt-2">
                    <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-2 flex items-center gap-1"><MapIcon className="w-3 h-3" /> Attractions / Places Visited</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {places.map(p => (
                        <div key={p.id} className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center shadow-sm">
                          <div className="font-semibold text-xs truncate pr-2" title={p.name}>{p.name}</div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="font-bold text-xs">${(p.cost || p.estimatedCost || 0).toFixed(2)}</div>
                            <button onClick={() => handleToggle(p)} className="text-red-500 hover:text-red-700 transition-colors">
                              <Trash2 className="w-3.5 h-3.5"/>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
