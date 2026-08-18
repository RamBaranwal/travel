import { useState, useEffect } from 'react';
import { Settings2, Plus, Minus, Car, Map as MapIcon, Utensils, BedDouble, Calendar as CalendarIcon, Trash2 } from 'lucide-react';

const bikeModels = [
  { id: 'himalayan', name: 'Royal Enfield Himalayan', rate: 35 },
  { id: 'classic350', name: 'Royal Enfield Classic 350 / RZ', rate: 30 },
  { id: 'thunderbird', name: 'Royal Enfield Thunderbird', rate: 28 },
];

export default function FreeHandCustom({ tripState, setTripState }) {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [fuelParams, setFuelParams] = useState({ distance: 1300, mileage: 15, fuelPrice: 100 });
  const [bikeFuelParams, setBikeFuelParams] = useState({ distance: 1300, mileage: 30, fuelPrice: 100 });
  const [selectedBikeModel, setSelectedBikeModel] = useState(bikeModels[0]);

  useEffect(() => {
    if (tripState.destination) {
      setLoading(true);
      fetch(`/api/trips/catalog?destination=${encodeURIComponent(tripState.destination)}`)
        .then(res => res.json())
        .then(data => {
          setCatalog(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching catalog:", err);
          setLoading(false);
        });
    }
  }, [tripState.destination]);

  const isSelected = (id) => tripState.items.some(i => i.id === id || i._id === id);

  const handleToggle = (item) => {
    setTripState(prev => {
      let newItems = [...prev.items];
      const existsIdx = newItems.findIndex(i => i.id === (item.id || item._id) || i._id === (item.id || item._id));

      if (existsIdx !== -1) {
        newItems.splice(existsIdx, 1);
      } else {
        // EXCLUSIVE SELECTIONS
        if (item.category === 'transport') {
          newItems = newItems.filter(i => i.category !== 'transport');
        }
        if (item.category === 'accommodation') {
          newItems = newItems.filter(i => i.category !== 'accommodation');
        }
        if (item.category === 'food' || item.category === 'local-food') {
          newItems = newItems.filter(i => i.category !== 'food' && i.category !== 'local-food');
        }
        
        let assignedDay = null;
        if (item.category === 'place-to-visit') {
          // Assign to earliest available day (max 3 items per day)
          const placesCount = newItems.filter(i => i.category === 'place-to-visit' || i.category === 'food' || i.category === 'local-food').length;
          assignedDay = Math.floor(placesCount / 3) + 1;
          assignedDay = Math.min(assignedDay, prev.totalDays);
        }

        newItems.push({
          id: item._id || item.id,
          _id: item._id || item.id,
          category: item.category,
          type: item.type,
          name: item.name,
          cost: item.estimatedCost || item.cost,
          day: assignedDay
        });
      }

      return {
        ...prev,
        items: newItems
      };
    });
  };

  const handleFuelCalcSelect = () => {
    const cost = (fuelParams.distance / fuelParams.mileage) * fuelParams.fuelPrice;
    const item = {
      id: 'fuel-calc',
      category: 'transport',
      type: 'private-vehicle',
      name: `Private Vehicle (${fuelParams.distance}km)`,
      estimatedCost: cost
    };
    handleToggle(item);
  };

  const handleBikeSelect = (item) => {
    const fuelCost = (bikeFuelParams.distance / bikeFuelParams.mileage) * bikeFuelParams.fuelPrice;
    const rentalCost = selectedBikeModel.rate * tripState.totalDays;
    const totalCost = rentalCost + fuelCost;
    const newItem = {
      ...item,
      id: item._id || item.id,
      estimatedCost: totalCost / tripState.travelers, // Dividing by travelers so it multiplies back correctly in total sum
      name: `${selectedBikeModel.name} (+Fuel)`
    };
    handleToggle(newItem);
  };

  const transports = catalog.filter(i => i.category === 'transport');
  const accommodations = catalog.filter(i => i.category === 'accommodation');
  const foods = catalog.filter(i => i.category === 'food' || i.category === 'local-food');
  const places = catalog.filter(i => i.category === 'place-to-visit');

  const selectedTransport = tripState.items.find(i => i.category === 'transport');
  const selectedHotel = tripState.items.find(i => i.category === 'accommodation');
  const selectedFood = tripState.items.find(i => i.category === 'food' || i.category === 'local-food');

  // Generate Days Array
  const daysArray = Array.from({ length: tripState.totalDays }, (_, i) => i + 1);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Settings2 className="w-6 h-6 text-indigo-600"/> Itinerary Builder</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Drag or click items to build your day-by-day plan.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 py-10">Loading catalog for {tripState.destination}...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 h-[700px]">
          
          {/* LEFT PANEL: Day-by-Day Timeline */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 overflow-y-auto">
            <h3 className="font-bold text-lg mb-4 sticky top-0 bg-slate-50 dark:bg-slate-900/90 py-2 z-10 border-b border-slate-200 dark:border-slate-800">Your Timeline</h3>
            
            <div className="space-y-6">
              {/* Global Trip Items (Transport & Hotel) */}
              <div className="space-y-3 relative pl-6 border-l-2 border-indigo-200 dark:border-indigo-900/50">
                <div className="absolute -left-[11px] top-0 w-5 h-5 bg-indigo-100 border-2 border-indigo-500 rounded-full"></div>
                <h4 className="font-semibold text-indigo-700 dark:text-indigo-400 text-sm uppercase tracking-wider">Trip Foundation</h4>
                
                {selectedTransport ? (
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm shadow-sm flex justify-between items-center group">
                    <div className="flex items-center gap-2 font-medium"><Car className="w-4 h-4 text-slate-400"/> {selectedTransport.name}</div>
                    <button onClick={() => handleToggle(selectedTransport)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic p-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">Select transport from catalog...</div>
                )}

                {selectedHotel ? (
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm shadow-sm flex justify-between items-center group">
                    <div className="flex items-center gap-2 font-medium"><BedDouble className="w-4 h-4 text-slate-400"/> {selectedHotel.name} <span className="text-xs text-slate-400 font-normal">({tripState.totalDays} nights)</span></div>
                    <button onClick={() => handleToggle(selectedHotel)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic p-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">Select accommodation from catalog...</div>
                )}

                {selectedFood ? (
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm shadow-sm flex justify-between items-center group">
                    <div className="flex items-center gap-2 font-medium"><Utensils className="w-4 h-4 text-slate-400"/> {selectedFood.name}</div>
                    <button onClick={() => handleToggle(selectedFood)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic p-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">Select food option from catalog...</div>
                )}
              </div>

              {/* Day by Day Items */}
              {daysArray.map(dayNum => {
                const dayItems = tripState.items.filter(i => i.day === dayNum);
                return (
                  <div key={dayNum} className="space-y-3 relative pl-6 border-l-2 border-slate-200 dark:border-slate-800">
                    <div className="absolute -left-[11px] top-0 w-5 h-5 bg-slate-100 border-2 border-slate-300 dark:border-slate-600 rounded-full flex items-center justify-center text-[10px] font-bold">{dayNum}</div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Day {dayNum}</h4>
                    
                    {dayItems.length > 0 ? (
                      <div className="space-y-2">
                        {dayItems.map(item => (
                          <div key={item.id} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm shadow-sm flex justify-between items-center group">
                            <div className="font-medium truncate pr-2">{item.name}</div>
                            <button onClick={() => handleToggle(item)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"><Trash2 className="w-4 h-4"/></button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic p-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/20">
                        Add places to visit for Day {dayNum}...
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL: The Catalog */}
          <div className="overflow-y-auto pr-2 space-y-8">
            
            <section>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-indigo-600"><Car className="w-4 h-4"/> Transport (Select One)</h3>
              <div className="space-y-2">
                {transports.filter(i => !isSelected(i._id)).map(item => {
                  if (item.type === 'bike') {
                    const previewFuelCost = (bikeFuelParams.distance / bikeFuelParams.mileage) * bikeFuelParams.fuelPrice;
                    const previewRentalCost = selectedBikeModel.rate * tripState.totalDays;
                    const previewTotalCost = previewRentalCost + previewFuelCost;

                    return (
                      <div key={item._id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 transition-all shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-col space-y-2">
                            <div className="font-medium text-sm">Bike Rental & Fuel</div>
                            <select 
                              value={selectedBikeModel.id} 
                              onChange={(e) => setSelectedBikeModel(bikeModels.find(b => b.id === e.target.value))}
                              className="text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded px-2 py-1 outline-none text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                            >
                              {bikeModels.map(b => (
                                <option key={b.id} value={b.id}>{b.name} (${b.rate.toFixed(2)}/day)</option>
                              ))}
                            </select>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">${previewTotalCost.toFixed(2)}</div>
                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Est.</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3 mb-3">
                          <div>
                            <span className="block text-slate-500 mb-1 font-semibold uppercase tracking-wider text-[9px]">Dist (km)</span>
                            <input type="number" value={bikeFuelParams.distance} onChange={e => setBikeFuelParams(p => ({...p, distance: parseFloat(e.target.value) || 0}))} className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 border outline-none font-medium"/>
                          </div>
                          <div>
                            <span className="block text-slate-500 mb-1 font-semibold uppercase tracking-wider text-[9px]">Mileage</span>
                            <input type="number" value={bikeFuelParams.mileage} onChange={e => setBikeFuelParams(p => ({...p, mileage: parseFloat(e.target.value) || 1}))} className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 border outline-none font-medium"/>
                          </div>
                          <div>
                            <span className="block text-slate-500 mb-1 font-semibold uppercase tracking-wider text-[9px]">$/Liter</span>
                            <input type="number" value={bikeFuelParams.fuelPrice} onChange={e => setBikeFuelParams(p => ({...p, fuelPrice: parseFloat(e.target.value) || 0}))} className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 border outline-none font-medium"/>
                          </div>
                        </div>
                        <button onClick={() => handleBikeSelect(item)} className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5">
                          <Plus className="w-3.5 h-3.5"/> Add to Itinerary
                        </button>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={item._id} onClick={() => handleToggle(item)} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 cursor-pointer flex justify-between items-center transition-all shadow-sm">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-bold">${(item.estimatedCost * tripState.travelers).toFixed(2)}</div>
                        <Plus className="w-4 h-4 text-slate-400"/>
                      </div>
                    </div>
                  );
                })}
                
                {!isSelected('fuel-calc') && (
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 transition-all shadow-sm">
                    <div className="flex justify-between items-center cursor-pointer mb-2" onClick={handleFuelCalcSelect}>
                      <div className="font-medium text-sm">Private Vehicle (Fuel Calc)</div>
                      <Plus className="w-4 h-4 text-slate-400"/>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-2">
                      <div>
                        <span className="block text-slate-500 mb-1">Dist (km)</span>
                        <input type="number" value={fuelParams.distance} onChange={e => setFuelParams(p => ({...p, distance: parseFloat(e.target.value)}))} className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 border outline-none"/>
                      </div>
                      <div>
                        <span className="block text-slate-500 mb-1">Mileage</span>
                        <input type="number" value={fuelParams.mileage} onChange={e => setFuelParams(p => ({...p, mileage: parseFloat(e.target.value)}))} className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 border outline-none"/>
                      </div>
                      <div>
                        <span className="block text-slate-500 mb-1">$/Liter</span>
                        <input type="number" value={fuelParams.fuelPrice} onChange={e => setFuelParams(p => ({...p, fuelPrice: parseFloat(e.target.value)}))} className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 border outline-none"/>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-rose-600"><BedDouble className="w-4 h-4"/> Hotels (Select One)</h3>
              <div className="space-y-2">
                {accommodations.filter(i => !isSelected(i._id)).map(item => (
                  <div key={item._id} onClick={() => handleToggle(item)} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-rose-300 cursor-pointer flex justify-between items-center transition-all shadow-sm">
                    <div>
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{item.tags?.[0]}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-bold">${(item.estimatedCost * tripState.totalDays).toFixed(2)}</div>
                      <Plus className="w-4 h-4 text-slate-400"/>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-teal-600"><MapIcon className="w-4 h-4"/> Places to Visit</h3>
              <div className="grid grid-cols-2 gap-2">
                {places.filter(i => !isSelected(i._id)).map(item => (
                  <div key={item._id} onClick={() => handleToggle(item)} className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-300 cursor-pointer flex justify-between items-center transition-all shadow-sm group">
                    <div className="font-medium text-xs truncate pr-2">{item.name}</div>
                    <Plus className="w-3 h-3 text-slate-400 group-hover:text-teal-500 shrink-0"/>
                  </div>
                ))}
                {places.filter(i => !isSelected(i._id)).length === 0 && (
                  <div className="col-span-2 text-center text-xs text-slate-500 py-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">All places added!</div>
                )}
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-amber-600"><Utensils className="w-4 h-4"/> Food Stops</h3>
              <div className="grid grid-cols-2 gap-2">
                {foods.filter(i => !isSelected(i._id)).map(item => (
                  <div key={item._id} onClick={() => handleToggle(item)} className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-300 cursor-pointer flex justify-between items-center transition-all shadow-sm group">
                    <div className="font-medium text-xs truncate pr-2">{item.name}</div>
                    <Plus className="w-3 h-3 text-slate-400 group-hover:text-amber-500 shrink-0"/>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>
      )}
    </div>
  );
}
