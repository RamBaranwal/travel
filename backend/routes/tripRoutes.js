const mongoose = require('mongoose');

const dailyItinerarySchema = new mongoose.Schema({
    day: Number,
    accommodation: {
        name: String,
        cost: Number
    },
    food: [{
        name: String,
        cost: Number
    }],
    activities: [{
        name: String,
        cost: Number
    }]
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
    itineraryDays: [dailyItinerarySchema],
    items: [mongoose.Schema.Types.Mixed],
    totalCalculatedCost: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
```[cite: 4]

---

### 2. Update Controller: `backend / controllers / tripController.js`
Ensure saving and calculation handles the structured daily breakdown.

```javascript
const Trip = require('../models/Trip');
const { evaluateBudget } = require('../services/budgetGuardrailService');

exports.calculateTrip = async (req, res) => {
    try {
        const { items, budgetCap, destination, travelers = 1, totalDays = 1, itineraryDays } = req.body;
        if (!budgetCap || !destination) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const evaluation = await evaluateBudget(items, budgetCap, destination, travelers, totalDays, itineraryDays);
        res.json(evaluation);
    } catch (error) {
        res.status(500).json({ message: 'Error calculating trip', error: error.message });
    }
};

exports.saveTrip = async (req, res) => {
    try {
        const trip = new Trip({
            ...req.body,
            userId: req.body.userId || '60d0fe4f5311236168a109ca'
        });
        const savedTrip = await trip.save();
        res.status(201).json(savedTrip);
    } catch (error) {
        res.status(500).json({ message: 'Error saving trip', error: error.message });
    }
};
```[cite: 2]

---

### 3. Complete Updated Component: `frontend / src / components / modes / FreeHandCustom.jsx`
This fixes the header overlap/gap issue (by changing overflow styling and using fixed positioning for modals), adds the popup modal for car and bike rentals with separate calculators, and integrates daily food and accommodation slots directly into each day block.

```jsx
import { useState, useEffect } from 'react';
import { Settings2, Plus, Car, Map as MapIcon, Utensils, BedDouble, Trash2, X, ShieldAlert } from 'lucide-react';

const rentalFleet = {
    cars: [
        { id: 'sedan', name: 'Swift Dzire Sedan', type: 'car', rate: 50, mileage: 18 },
        { id: 'suv', name: 'Mahindra Scorpio SUV', type: 'car', rate: 85, mileage: 12 },
        { id: 'luxury_suv', name: 'Toyota Fortuner', type: 'car', rate: 130, mileage: 10 }
    ],
    bikes: [
        { id: 'scooter', name: 'Honda Activa 6G', type: 'bike', rate: 15, mileage: 45 },
        { id: 'classic350', name: 'Royal Enfield Classic 350', type: 'bike', rate: 30, mileage: 30 },
        { id: 'himalayan', name: 'Royal Enfield Himalayan', type: 'bike', rate: 38, mileage: 25 }
    ]
};

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

    const handleAddDailyStayOrFood = (dayNum, category, item) => {
        setTripState(prev => {
            const filtered = prev.items.filter(i => !(i.day === dayNum && i.category === category));
            return {
                ...prev,
                items: [...filtered, {
                    id: item._id || `${category}-${dayNum}`,
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
            items: [...prev.items.filter(i => i.category !== 'transport'), rentalItem]
        }));
        setShowRentalModal(false);
    };

    const selectedTransport = tripState.items.find(i => i.category === 'transport');
    const accommodations = catalog.filter(i => i.category === 'accommodation');
    const foods = catalog.filter(i => i.category === 'food' || i.category === 'local-food');
    const places = catalog.filter(i => i.category === 'place-to-visit');

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
                    <div className="md:col-span-7 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 max-h-[650px] overflow-y-auto space-y-6">
                        <h3 className="font-bold text-base sticky top-0 bg-slate-50 dark:bg-slate-900 py-2 z-10 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                            Trip Timeline Overview
                        </h3>

                        {/* General Foundation Transport */}
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <Car className="w-4 h-4 text-blue-600" />
                                <span>Selected Transport:</span>
                                <span className="text-slate-600 dark:text-slate-300 font-normal">
                                    {selectedTransport ? selectedTransport.name : 'None selected (Click Rent Car/Bike above)'}
                                </span>
                            </div>
                        </div>

                        {/* Days Breakdown */}
                        {daysArray.map(dayNum => {
                            const dayPlaces = tripState.items.filter(i => i.category === 'place-to-visit' && i.day === dayNum);
                            const dayHotel = tripState.items.find(i => i.category === 'accommodation' && i.day === dayNum);
                            const dayFood = tripState.items.find(i => i.category === 'food' && i.day === dayNum);

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

                                    {/* Accommodation for the day */}
                                    <div className="text-xs flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                        <span className="font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                            <BedDouble className="w-3.5 h-3.5 text-indigo-500" /> Hotel Stay:
                                        </span>
                                        <select
                                            value={dayHotel?.name || ''}
                                            onChange={(e) => {
                                                const found = accommodations.find(a => a.name === e.target.value);
                                                if (found) handleAddDailyStayOrFood(dayNum, 'accommodation', found);
                                            }}
                                            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 font-medium text-slate-800 dark:text-slate-200 outline-none max-w-[200px]"
                                        >
                                            <option value="">Select Hotel...</option>
                                            {accommodations.map(acc => (
                                                <option key={acc._id} value={acc.name}>{acc.name} (${acc.estimatedCost}/n)</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Food for the day */}
                                    <div className="text-xs flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                        <span className="font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                            <Utensils className="w-3.5 h-3.5 text-orange-500" /> Dining / Food:
                                        </span>
                                        <select
                                            value={dayFood?.name || ''}
                                            onChange={(e) => {
                                                const found = foods.find(f => f.name === e.target.value);
                                                if (found) handleAddDailyStayOrFood(dayNum, 'food', found);
                                            }}
                                            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 font-medium text-slate-800 dark:text-slate-200 outline-none max-w-[200px]"
                                        >
                                            <option value="">Select Food Stop...</option>
                                            {foods.map(fd => (
                                                <option key={fd._id} value={fd.name}>{fd.name} (${fd.estimatedCost})</option>
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
                    <div className="md:col-span-5 space-y-4 max-h-[650px] overflow-y-auto pr-2">
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
                            <div className="space-y-2">
                                {places.map(place => {
                                    const isAddedOnTarget = tripState.items.some(i => i.id === place._id && i.day === activeDayTarget);
                                    return (
                                        <div
                                            key={place._id}
                                            onClick={() => handleTogglePlace(place, activeDayTarget)}
                                            className={`p-2.5 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${isAddedOnTarget
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-800 dark:text-slate-200'
                                                }`}
                                        >
                                            <div>
                                                <div className="font-semibold text-xs">{place.name}</div>
                                                <div className="text-[10px] text-slate-400">Est: ${place.estimatedCost}</div>
                                            </div>
                                            <Plus className="w-3.5 h-3.5 text-slate-400" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* RENTAL VEHICLE MODAL (Cars & Bikes Pop Up) */}
            {showRentalModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Car className="w-5 text-blue-600" /> Vehicle Rental & Fuel Estimator
                            </h3>
                            <button onClick={() => setShowRentalModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Category Tabs: Cars vs Bikes */}
                        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            <button
                                onClick={() => { setRentalTab('cars'); setSelectedVehicle(rentalFleet.cars[0]); }}
                                className={`py-2 text-xs font-bold rounded-lg transition-all ${rentalTab === 'cars' ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-500'}`}
                            >
                                Cars
                            </button>
                            <button
                                onClick={() => { setRentalTab('bikes'); setSelectedVehicle(rentalFleet.bikes[0]); }}
                                className={`py-2 text-xs font-bold rounded-lg transition-all ${rentalTab === 'bikes' ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-500'}`}
                            >
                                Bikes / Scooters
                            </button>
                        </div>

                        {/* Vehicle Options Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            {rentalFleet[rentalTab].map(veh => (
                                <div
                                    key={veh.id}
                                    onClick={() => setSelectedVehicle(veh)}
                                    className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${selectedVehicle.id === veh.id
                                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-bold'
                                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                        }`}
                                >
                                    <div className="text-xs truncate mb-1">{veh.name}</div>
                                    <div className="text-sm font-extrabold">${veh.rate}/day</div>
                                    <div className="text-[9px] text-slate-400 mt-1">{veh.mileage} km/L</div>
                                </div>
                            ))}
                        </div>

                        {/* Dedicated Calculator for this Rental */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                            <div className="font-bold text-slate-700 dark:text-slate-300">Trip Fuel & Distance Calculator ({selectedVehicle.name})</div>
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