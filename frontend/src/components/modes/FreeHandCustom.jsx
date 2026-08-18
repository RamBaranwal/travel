import { useState, useEffect } from 'react';
import { Settings2, Plus, Car, Map as MapIcon, Utensils, BedDouble, Trash2, X, Bus, Train, Plane } from 'lucide-react';

const rentalFleet = {
  cars: [
    { id: 'sedan', name: 'Swift Dzire Sedan', type: 'car', rate: 50, mileage: 18 },
    { id: 'suv', name: 'Mahindra Scorpio SUV', type: 'car', rate: 85, mileage: 12 },
    { id: 'luxury_suv', name: 'Toyota Fortuner', type: 'car', rate: 130, mileage: 10 },
    { id: 'muv', name: 'Innova Crysta MUV', type: 'car', rate: 100, mileage: 14 }
  ],
  bikes: [
    { id: 'scooter', name: 'Honda Activa 6G', type: 'bike', rate: 15, mileage: 45 },
    { id: 'classic350', name: 'Royal Enfield Classic 350', type: 'bike', rate: 30, mileage: 30 },
    { id: 'himalayan', name: 'Royal Enfield Himalayan', type: 'bike', rate: 38, mileage: 25 },
    { id: 'adventure', name: 'KTM Adventure 390', type: 'bike', rate: 45, mileage: 22 }
  ]
};

const baseTransportCatalog = {
  'Ladakh, India': [
    { id: 't-flight', name: 'Flight (Delhi to Leh) + Airport Cab', category: 'transport', type: 'flight', cost: 180 },
    { id: 't-bus', name: 'Volvo Bus (Delhi to Manali to Leh) + Local Transit', category: 'transport', type: 'bus', cost: 75 },
    { id: 't-train', name: 'Train to Chandigarh + Cab to Ladakh', category: 'transport', type: 'train', cost: 110 }
  ],
  'Kolkata, India': [
    { id: 't-flight', name: 'Flight (Delhi to CCU) + Yellow Taxi', category: 'transport', type: 'flight', cost: 120 },
    { id: 't-bus', name: 'Rajdhani / Express Bus + Local Auto', category: 'transport', type: 'bus', cost: 50 },
    { id: 't-train', name: ' राजधानी Express Train + Metro/Cab', category: 'transport', type: 'train', cost: 70 }
  ],
  'Goa, India': [
    { id: 't-flight', name: 'Flight (Delhi to GOI) + Rental Scooter/Cab', category: 'transport', type: 'flight', cost: 140 },
    { id: 't-bus', name: 'Overnight Volvo Bus + Local Cab', category: 'transport', type: 'bus', cost: 65 },
    { id: 't-train', name: 'Goa Express Train + Auto Fair', category: 'transport', type: 'train', cost: 80 }
  ]
};

const dailyLocalTransports = [
  { id: 'local-cab', name: 'Local Sightseeing Cab', cost: 45 },
  { id: 'local-auto', name: 'Auto Rickshaw Pass', cost: 15 },
  { id: 'local-bus', name: 'Local Public Bus Pass', cost: 8 },
  { id: 'local-rental', name: 'Daily Bike Rental Share', cost: 20 }
];

export default function FreeHandCustom({ tripState, setTripState }) {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRentalModal, setShowRentalModal] = useState(false);

  // Modal State for Rental Vehicle Calculator
  const [rentalTab, setRentalTab] = useState('cars');
  const [selectedVehicle, setSelectedVehicle] = useState(rentalFleet.cars[0]);
  const [modalDist, setModalDist] = useState(500);
  const [modalFuelPrice, setModalFuelPrice] = useState(100);
  const [activeDayTarget, setActiveDayTarget] = useState(1);

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

  const daysArray = Array.from({ length: tripState.totalDays || 1 }, (_, i) => i + 1);

  const handleTogglePlace = (item, dayNum) => {
    setTripState(prev => {
      const exists = prev.items.some(i => i.id === item._id && i.day === dayNum);
      let newItems = [...prev.items];
      if (exists) {
        newItems = newItems.filter(i => !(i.id === item._id && i.day === dayNum));
      } else {
        newItems.push({
          id: item._id,
          category: 'place-to-visit',
          name: item.name,
          cost: parseFloat(item.estimatedCost || 0),
          day: dayNum
        });
      }
      return { ...prev, items: newItems };
    });
  };

  const handleSelectFoundationTransport = (transItem) => {
    setTripState(prev => ({
      ...prev,
      items: [
        ...prev.items.filter(i => i.category !== 'transport' || i.day !== undefined),
        {
          id: transItem.id,
          category: 'transport',
          type: transItem.type,
          name: transItem.name,
          cost: parseFloat(transItem.cost || 0)
        }
      ]
    }));
  };

  const handleAddDailyStayFoodOrTransport = (dayNum, category, item) => {
    setTripState(prev => {
      const filtered = prev.items.filter(i => !(i.day === dayNum && i.category === category));
      return {
        ...prev,
        items: [...filtered, {
          id: item._id || item.id || `${category}-${dayNum}`,
          category,
          name: item.name,
          cost: parseFloat(item.estimatedCost || item.cost || 0),
          day: dayNum
        }]
      };
    });
  };

  const handleConfirmRentalModal = () => {
    const totalDays = tripState.totalDays || 1;
    const rentalCost = selectedVehicle.rate * totalDays;
    const fuelCost = (modalDist / selectedVehicle.mileage) * modalFuelPrice;
    const totalCost = rentalCost + fuelCost;

    const rentalItem = {
      id: `rental-${selectedVehicle.id}`,
      category: 'transport',
      type: selectedVehicle.type,
      name: `${selectedVehicle.name} (${totalDays}d Rental + Fuel)`,
      cost: totalCost
    };

    setTripState(prev => ({
      ...prev,
      items: [...prev.items.filter(i => i.category !== 'transport' || i.day !== undefined), rentalItem]
    }));
    setShowRentalModal(false);
  };

  const selectedTransport = tripState.items.find(i => i.category === 'transport' && i.day === undefined);
  const accommodations = catalog.filter(i => i.category === 'accommodation');
  const foods = catalog.filter(i => i.category === 'food' || i.category === 'local-food');
  const places = catalog.filter(i => i.category === 'place-to-visit');
  const currentDestinationTransports = baseTransportCatalog[tripState.destination] || baseTransportCatalog['Ladakh, India'];

  return (
    <div className="relative animate-in fade-in duration-300 flex flex-col h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Settings2 className="w-6 h-6 text-slate-700 dark:text-slate-300" /> Modular Itinerary Planner
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Organize daily stays, dining, transport, and custom visits seamlessly.</p>
        </div>
        <button
          onClick={() => setShowRentalModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
        >
          <Car className="w-4 h-4" /> Rent Car / Bike Calculator
        </button>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 py-12">Loading destination data...</div>
      ) : (
        <div className="grid md:grid-cols-12 gap-6">

          {/* TIMELINE SECTION (Left Column) */}
          <div className="md:col-span-7 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 max-h-[680px] overflow-y-auto space-y-6 relative">

            {/* Sticky Header positioned securely at top-0 with solid background */}
            <div className="sticky top-0 bg-slate-50 dark:bg-slate-900 pt-3 pb-3 z-30 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Trip Timeline Overview
              </h3>
            </div>

            {/* General Foundation Transport Selection */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><Plane className="w-4 h-4 text-blue-600" /> Foundation Transport (Delhi to {tripState.destination})</span>
                {selectedTransport && <span className="text-emerald-600 font-extrabold">${selectedTransport.cost.toFixed(2)}</span>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {currentDestinationTransports.map(t => {
                  const isChosen = selectedTransport?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelectFoundationTransport(t)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${isChosen
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-300'
                        }`}
                    >
                      <div className="truncate">{t.name}</div>
                      <div className="text-[10px] text-slate-400 mt-1">${t.cost.toFixed(2)}</div>
                    </button>
                  );
                })}
              </div>
              {selectedTransport && (
                <div className="text-xs text-slate-500 italic flex justify-between items-center pt-1">
                  <span>Selected: {selectedTransport.name}</span>
                  <button onClick={() => setTripState(p => ({ ...p, items: p.items.filter(i => i.id !== selectedTransport.id) }))} className="text-red-500 font-bold hover:underline">Remove</button>
                </div>
              )}
            </div>

            {/* Days Breakdown */}
            {daysArray.map(dayNum => {
              const dayPlaces = tripState.items.filter(i => i.category === 'place-to-visit' && i.day === dayNum);
              const dayHotel = tripState.items.find(i => i.category === 'accommodation' && i.day === dayNum);
              const dayFood = tripState.items.find(i => i.category === 'food' && i.day === dayNum);
              const dayTransport = tripState.items.find(i => i.category === 'transport' && i.day === dayNum);

              return (
                <div key={dayNum} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs">
                        {dayNum}
                      </span>
                      Day {dayNum} Itinerary
                    </h4>
                  </div>

                  {/* Hotel Stay for the Day */}
                  <div className="text-xs flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <BedDouble className="w-3.5 h-3.5 text-indigo-500" /> Hotel Stay:
                    </span>
                    <select
                      value={dayHotel?.name || ''}
                      onChange={(e) => {
                        const found = accommodations.find(a => a.name === e.target.value);
                        if (found) handleAddDailyStayFoodOrTransport(dayNum, 'accommodation', found);
                      }}
                      className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 font-medium text-slate-800 dark:text-slate-200 outline-none max-w-[210px]"
                    >
                      <option value="">Select Hotel...</option>
                      {accommodations.map(acc => (
                        <option key={acc._id} value={acc.name}>{acc.name} (${acc.estimatedCost.toFixed(2)}/n)</option>
                      ))}
                    </select>
                  </div>

                  {/* Dining / Food for the Day */}
                  <div className="text-xs flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Utensils className="w-3.5 h-3.5 text-orange-500" /> Dining / Food:
                    </span>
                    <select
                      value={dayFood?.name || ''}
                      onChange={(e) => {
                        const found = foods.find(f => f.name === e.target.value);
                        if (found) handleAddDailyStayFoodOrTransport(dayNum, 'food', found);
                      }}
                      className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 font-medium text-slate-800 dark:text-slate-200 outline-none max-w-[210px]"
                    >
                      <option value="">Select Food Stop...</option>
                      {foods.map(fd => (
                        <option key={fd._id} value={fd.name}>{fd.name} (${fd.estimatedCost.toFixed(2)})</option>
                      ))}
                    </select>
                  </div>

                  {/* Daily Transit Mode */}
                  <div className="text-xs flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Car className="w-3.5 h-3.5 text-blue-500" /> Daily Transit:
                    </span>
                    <select
                      value={dayTransport?.name || ''}
                      onChange={(e) => {
                        const found = dailyLocalTransports.find(dt => dt.name === e.target.value);
                        if (found) handleAddDailyStayFoodOrTransport(dayNum, 'transport', found);
                      }}
                      className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 font-medium text-slate-800 dark:text-slate-200 outline-none max-w-[210px]"
                    >
                      <option value="">Select Transport...</option>
                      {dailyLocalTransports.map(dt => (
                        <option key={dt.id} value={dt.name}>{dt.name} (${dt.cost.toFixed(2)})</option>
                      ))}
                    </select>
                  </div>

                  {/* Places selected for this day */}
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Places Visited on Day {dayNum}:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {dayPlaces.length > 0 ? (
                        dayPlaces.map(p => (
                          <span key={p.id} className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg text-xs font-medium">
                            {p.name}
                            <button onClick={() => handleTogglePlace({ _id: p.id }, dayNum)} className="hover:text-red-600">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No places picked for this day yet. Click options from the right catalog.</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CATALOG SECTION (Right Column) */}
          <div className="md:col-span-5 space-y-4 max-h-[680px] overflow-y-auto pr-2">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white">
                  <MapIcon className="w-4 h-4 text-emerald-600" /> Explore Places
                </h3>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-500">Target Day:</span>
                  <select
                    value={activeDayTarget}
                    onChange={(e) => setActiveDayTarget(parseInt(e.target.value, 10))}
                    className="bg-slate-100 dark:bg-slate-800 border rounded px-2 py-0.5 font-bold outline-none text-xs"
                  >
                    {daysArray.map(d => (
                      <option key={d} value={d}>Day {d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2-Column Grid */}
              <div className="grid grid-cols-2 gap-2">
                {places.map(place => {
                  const isAddedOnTarget = tripState.items.some(i => i.id === place._id && i.day === activeDayTarget);
                  return (
                    <div
                      key={place._id}
                      onClick={() => handleTogglePlace(place, activeDayTarget)}
                      className={`p-2.5 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${isAddedOnTarget
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300 font-semibold'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-800 dark:text-slate-200'
                        }`}
                    >
                      <div className="truncate pr-1">
                        <div className="font-semibold text-xs truncate">{place.name}</div>
                        <div className="text-[10px] text-slate-400">Est: ${place.estimatedCost.toFixed(2)}</div>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENTAL VEHICLE MODAL */}
      {showRentalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Car className="w-5 text-blue-600" /> Private Vehicle Pricing & Calculator
              </h3>
              <button onClick={() => setShowRentalModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() => { setRentalTab('cars'); setSelectedVehicle(rentalFleet.cars[0]); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${rentalTab === 'cars' ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-500'}`}
              >
                Rent a Car
              </button>
              <button
                onClick={() => { setRentalTab('bikes'); setSelectedVehicle(rentalFleet.bikes[0]); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${rentalTab === 'bikes' ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-500'}`}
              >
                Rent a Bike
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {rentalFleet[rentalTab].map(veh => (
                <div
                  key={veh.id}
                  onClick={() => setSelectedVehicle(veh)}
                  className={`p-2.5 rounded-xl border cursor-pointer text-center transition-all ${selectedVehicle.id === veh.id
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                >
                  <div className="text-xs truncate mb-1">{veh.name}</div>
                  <div className="text-sm font-extrabold">${veh.rate.toFixed(2)}/day</div>
                  <div className="text-[9px] text-slate-400 mt-1">{veh.mileage} km/L</div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300">Travel Cost Calculator ({selectedVehicle.name})</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Estimated Distance (km)</label>
                  <input
                    type="number"
                    value={modalDist}
                    onChange={(e) => setModalDist(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-slate-900 border rounded-lg px-3 py-2 font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Fuel Price ($/Liter)</label>
                  <input
                    type="number"
                    value={modalFuelPrice}
                    onChange={(e) => setModalFuelPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-slate-900 border rounded-lg px-3 py-2 font-medium outline-none"
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-bold">
                <span>Calculated Total Cost:</span>
                <span className="text-blue-600">
                  ${((selectedVehicle.rate * (tripState.totalDays || 1)) + ((modalDist / selectedVehicle.mileage) * modalFuelPrice)).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleConfirmRentalModal}
              className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-opacity"
            >
              Confirm & Add to Trip Foundation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}