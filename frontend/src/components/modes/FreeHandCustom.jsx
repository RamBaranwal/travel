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
  const [itemDays, setItemDays] = useState({});

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
        if (item.category === 'transport') {
          newItems = newItems.filter(i => i.category !== 'transport');
        }
        if (item.category === 'accommodation') {
          newItems = newItems.filter(i => i.category !== 'accommodation');
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
      estimatedCost: totalCost / tripState.travelers, // Restored: Divides by travelers so it doesn't double multiply in the budget bar
      name: `${selectedBikeModel.name} (${tripState.totalDays}d + Fuel)`
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

  const daysArray = Array.from({ length: tripState.totalDays }, (_, i) => i + 1);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900"><Settings2 className="w-6 h-6 text-slate-700" /> Itinerary Builder</h2>
          <p className="text-slate-500 text-sm">Select items to build your day-by-day plan.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 py-10">Loading catalog for {tripState.destination}...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 h-[700px]">

          {/* LEFT PANEL: Timeline */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-200 z-10 shrink-0">
              <h3 className="font-bold text-lg text-slate-900">Your Timeline</h3>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 space-y-6">
              <div className="space-y-3 relative pl-6 border-l-2 border-slate-300">
                <div className="absolute -left-[11px] top-0 w-5 h-5 bg-slate-200 border-2 border-slate-500 rounded-full"></div>
                <h4 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Trip Foundation</h4>
                
                {selectedTransport ? (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-sm shadow-sm flex justify-between items-center group">
                    <div className="flex items-center gap-2 font-medium text-slate-800"><Car className="w-4 h-4 text-slate-600" /> {selectedTransport.name}</div>
                    <button onClick={() => handleToggle(selectedTransport)} className="text-slate-400 hover:text-slate-900 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic p-2 border border-dashed border-slate-300 rounded-lg">Select transport from catalog...</div>
                )}

                {selectedHotel ? (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-sm shadow-sm flex justify-between items-center group">
                    <div className="flex items-center gap-2 font-medium text-slate-800"><BedDouble className="w-4 h-4 text-slate-600" /> {selectedHotel.name} <span className="text-xs text-slate-500 font-normal">({tripState.totalDays} nights)</span></div>
                    <button onClick={() => handleToggle(selectedHotel)} className="text-slate-400 hover:text-slate-900 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic p-2 border border-dashed border-slate-300 rounded-lg">Select accommodation from catalog...</div>
                )}
              </div>

              {daysArray.map(dayNum => {
                const dayItems = tripState.items.filter(i => i.day === dayNum);
                return (
                  <div key={dayNum} className="space-y-3 relative pl-6 border-l-2 border-slate-200">
                    <div className="absolute -left-[11px] top-0 w-5 h-5 bg-slate-100 border-2 border-slate-400 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-700">{dayNum}</div>
                    <h4 className="font-semibold text-slate-700 text-sm">Day {dayNum}</h4>

                    {dayItems.length > 0 ? (
                      <div className="space-y-2">
                        {dayItems.map(item => (
                          <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200 text-sm shadow-sm flex justify-between items-center group">
                            <div className="font-medium text-slate-800 truncate pr-2">{item.name}</div>
                            <button onClick={() => handleToggle(item)} className="text-slate-400 hover:text-slate-900 transition-opacity shrink-0"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic p-3 border border-dashed border-slate-200 rounded-xl bg-white/50">
                        Add places to visit for Day {dayNum}...
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL: Catalog */}
          <div className="overflow-y-auto pr-2 space-y-8">

            <section>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-slate-900"><Car className="w-4 h-4 text-slate-700" /> Transport (Select One)</h3>
              <div className="space-y-2">
                {transports.filter(i => !isSelected(i._id)).map(item => {
                  if (item.type === 'bike') {
                    const previewFuelCost = (bikeFuelParams.distance / bikeFuelParams.mileage) * bikeFuelParams.fuelPrice;
                    const previewRentalCost = selectedBikeModel.rate * tripState.totalDays;
                    const previewTotalCost = previewRentalCost + previewFuelCost;

                    return (
                      <div key={item._id} className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-400 transition-all shadow-sm">
                        <div className="font-semibold text-sm text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                          <Car className="w-4 h-4 text-slate-500" /> 3-Step Bike & Fuel Calculator
                        </div>
                        
                        {/* Step 1 */}
                        <div className="mb-4">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Step 1: Select Bike Model</div>
                          <select
                            value={selectedBikeModel.id}
                            onChange={(e) => setSelectedBikeModel(bikeModels.find(b => b.id === e.target.value))}
                            className="w-full text-xs border border-slate-300 bg-slate-50 rounded-lg px-2.5 py-1.5 outline-none text-slate-800 font-medium cursor-pointer"
                          >
                            {bikeModels.map(b => (
                              <option key={b.id} value={b.id}>{b.name} (${b.rate.toFixed(2)}/day)</option>
                            ))}
                          </select>
                        </div>

                        {/* Step 2 */}
                        <div className="mb-4">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Step 2: Fuel Pricing Calculator</div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="block text-slate-500 mb-1 font-semibold uppercase tracking-wider text-[9px]">Dist (km)</span>
                              <input type="number" value={bikeFuelParams.distance} onChange={e => setBikeFuelParams(p => ({ ...p, distance: parseFloat(e.target.value) || 0 }))} className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border-slate-300 border outline-none font-medium text-slate-800" />
                            </div>
                            <div>
                              <span className="block text-slate-500 mb-1 font-semibold uppercase tracking-wider text-[9px]">Mileage</span>
                              <input type="number" value={bikeFuelParams.mileage} onChange={e => setBikeFuelParams(p => ({ ...p, mileage: parseFloat(e.target.value) || 1 }))} className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border-slate-300 border outline-none font-medium text-slate-800" />
                            </div>
                            <div>
                              <span className="block text-slate-500 mb-1 font-semibold uppercase tracking-wider text-[9px]">$/Liter</span>
                              <input type="number" value={bikeFuelParams.fuelPrice} onChange={e => setBikeFuelParams(p => ({ ...p, fuelPrice: parseFloat(e.target.value) || 0 }))} className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border-slate-300 border outline-none font-medium text-slate-800" />
                            </div>
                          </div>
                        </div>

                        {/* Step 3 */}
                        <div className="border-t border-slate-100 pt-3">
                          <div className="flex justify-between items-end mb-3">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step 3: Add to Itinerary</div>
                            <div className="text-right">
                              <div className="text-sm font-black text-slate-900">${previewTotalCost.toFixed(2)}</div>
                              <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Computed Total</div>
                            </div>
                          </div>
                          <button onClick={() => handleBikeSelect(item)} className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5">
                            <Plus className="w-3.5 h-3.5" /> Add Bike & Fuel to Itinerary
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={item._id} onClick={() => handleToggle(item)} className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-400 cursor-pointer flex justify-between items-center transition-all shadow-sm">
                      <div className="font-medium text-sm text-slate-800">{item.name}</div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-bold text-slate-900">${(item.estimatedCost * tripState.travelers).toFixed(2)}</div>
                        <Plus className="w-4 h-4 text-slate-500" />
                      </div>
                    </div>
                  );
                })}

                {!isSelected('fuel-calc') && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-400 transition-all shadow-sm">
                    <div className="flex justify-between items-center cursor-pointer mb-2" onClick={handleFuelCalcSelect}>
                      <div className="font-medium text-sm text-slate-800">Private Vehicle (Fuel Calc)</div>
                      <Plus className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs border-t border-slate-100 pt-2">
                      <div>
                        <span className="block text-slate-500 mb-1">Dist (km)</span>
                        <input type="number" value={fuelParams.distance} onChange={e => setFuelParams(p => ({ ...p, distance: parseFloat(e.target.value) }))} className="w-full px-2 py-1 rounded bg-slate-50 border-slate-300 border outline-none text-slate-800" />
                      </div>
                      <div>
                        <span className="block text-slate-500 mb-1">Mileage</span>
                        <input type="number" value={fuelParams.mileage} onChange={e => setFuelParams(p => ({ ...p, mileage: parseFloat(e.target.value) }))} className="w-full px-2 py-1 rounded bg-slate-50 border-slate-300 border outline-none text-slate-800" />
                      </div>
                      <div>
                        <span className="block text-slate-500 mb-1">$/Liter</span>
                        <input type="number" value={fuelParams.fuelPrice} onChange={e => setFuelParams(p => ({ ...p, fuelPrice: parseFloat(e.target.value) }))} className="w-full px-2 py-1 rounded bg-slate-50 border-slate-300 border outline-none text-slate-800" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-slate-900"><BedDouble className="w-4 h-4 text-slate-700" /> Hotels (Select One)</h3>
              <div className="space-y-2">
                {accommodations.filter(i => !isSelected(i._id)).map(item => (
                  <div key={item._id} onClick={() => handleToggle(item)} className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-400 cursor-pointer flex justify-between items-center transition-all shadow-sm">
                    <div>
                      <div className="font-medium text-sm text-slate-800">{item.name}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{item.tags?.[0]}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-bold text-slate-900">${(item.estimatedCost * tripState.totalDays).toFixed(2)}</div>
                      <Plus className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-slate-900"><MapIcon className="w-4 h-4 text-slate-700" /> Places to Visit (Assign to Day)</h3>
              <div className="grid grid-cols-1 gap-2">
                {places.filter(i => !isSelected(i._id)).map(item => (
                  <div key={item._id} className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-400 flex justify-between items-center transition-all shadow-sm group">
                    <div className="font-medium text-xs truncate pr-2 text-slate-800">{item.name}</div>
                    <div className="flex items-center gap-2 shrink-0">
                      <select 
                        value={itemDays[item._id] || 1}
                        onChange={(e) => setItemDays(p => ({...p, [item._id]: parseInt(e.target.value)}))}
                        className="text-[10px] border border-slate-200 rounded px-1.5 py-1 bg-slate-50 text-slate-700 outline-none"
                      >
                        {daysArray.map(d => <option key={d} value={d}>Day {d}</option>)}
                      </select>
                      <button onClick={() => handleToggle(item, itemDays[item._id] || 1)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-slate-900"><Utensils className="w-4 h-4 text-slate-700" /> Food Stops (Assign to Day)</h3>
              <div className="grid grid-cols-1 gap-2">
                {foods.filter(i => !isSelected(i._id)).map(item => (
                  <div key={item._id} className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-400 flex justify-between items-center transition-all shadow-sm group">
                    <div className="font-medium text-xs truncate pr-2 text-slate-800">{item.name}</div>
                    <div className="flex items-center gap-2 shrink-0">
                      <select 
                        value={itemDays[item._id] || 1}
                        onChange={(e) => setItemDays(p => ({...p, [item._id]: parseInt(e.target.value)}))}
                        className="text-[10px] border border-slate-200 rounded px-1.5 py-1 bg-slate-50 text-slate-700 outline-none"
                      >
                        {daysArray.map(d => <option key={d} value={d}>Day {d}</option>)}
                      </select>
                      <button onClick={() => handleToggle(item, itemDays[item._id] || 1)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
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