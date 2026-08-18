import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation, Settings2, Package, MapPin, Calendar, Users, Map } from 'lucide-react';
import FixBudgetTrip from '../components/modes/FixBudgetTrip';
import FreeHandCustom from '../components/modes/FreeHandCustom';
import PrePlannedPackages from '../components/modes/PrePlannedPackages';
import BudgetBar from '../components/BudgetBar';
import LocalDiscoverySidebar from '../components/LocalDiscoverySidebar';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState('free-hand');
  
  // Shared state across modes
  const [tripState, setTripState] = useState({
    budgetCap: 2000,
    startLocation: 'Delhi, India',
    destination: 'Ladakh, India',
    startDate: '',
    endDate: '',
    travelers: 1,
    totalDays: 1,
    items: [],
    totalCost: 0
  });

  const handleTripSetupChange = (e) => {
    const { name, value } = e.target;
    setTripState(prev => {
      const newState = { ...prev, [name]: value };
      
      if (name === 'startDate' || name === 'endDate') {
        if (newState.startDate && newState.endDate) {
          const start = new Date(newState.startDate);
          const end = new Date(newState.endDate);
          const diffTime = Math.abs(end - start);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          newState.totalDays = diffDays > 0 ? diffDays : 1;
        }
      }
      return newState;
    });
  };

  // Recalculate total cost whenever items, travelers, or totalDays change
  useEffect(() => {
    let newTotal = 0;
    tripState.items.forEach(item => {
      let multiplier = 1;
      if (item.category === 'transport' || item.category === 'package' || item.category === 'activity') {
        multiplier = tripState.travelers;
      } else if (item.category === 'accommodation') {
        multiplier = tripState.totalDays;
      }
      newTotal += (item.cost * multiplier); // Note: item.cost should be base cost
    });
    setTripState(prev => ({ ...prev, totalCost: newTotal }));
  }, [tripState.items, tripState.travelers, tripState.totalDays]);

  const [tradeOffs, setTradeOffs] = useState([]);

  const modes = [
    { id: 'fix-budget', label: 'Fix Your Trip', icon: <Navigation className="w-4 h-4"/>, desc: 'Set a cap, we do the rest' },
    { id: 'free-hand', label: 'Complete Control', icon: <Settings2 className="w-4 h-4"/>, desc: 'Modular custom builder' },
    { id: 'pre-planned', label: 'All-Inclusive', icon: <Package className="w-4 h-4"/>, desc: 'Curated packages' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="text-blue-600 w-5 h-5" />
              VoyageCraft
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
              JD
            </div>
          </div>
        </div>
      </header>

      {/* Notice Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900 text-blue-800 dark:text-blue-300 px-4 py-3 text-sm font-medium text-center">
        Note: Showing localized route and cost calculation data for trips originating from Delhi to selected destinations (Ladakh, Kolkata, Goa).
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 grid lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Global Trip Setup */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="text-blue-600 w-5 h-5" />
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Trip Parameters</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
              {/* From Field */}
              <div className="flex flex-col space-y-1.5 min-w-0">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">From</label>
                <div className="flex items-center space-x-2 px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                  <MapPin className="text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    value="Delhi, India" 
                    disabled 
                    className="bg-transparent text-sm font-semibold text-gray-700 dark:text-gray-200 w-full focus:outline-none cursor-not-allowed truncate"
                  />
                </div>
              </div>

              {/* Destination Dropdown */}
              <div className="flex flex-col space-y-1.5 min-w-0">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">To (Destination)</label>
                <div className="flex items-center space-x-2 px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                  <MapPin className="text-gray-400 w-4 h-4" />
                  <select 
                    name="destination"
                    value={tripState.destination} 
                    onChange={handleTripSetupChange}
                    className="bg-transparent text-sm font-semibold text-gray-700 dark:text-gray-200 w-full focus:outline-none cursor-pointer truncate"
                  >
                    <option value="Ladakh, India">Ladakh, India</option>
                    <option value="Kolkata, India">Kolkata, India</option>
                    <option value="Goa, India">Goa, India</option>
                  </select>
                </div>
              </div>

              {/* Dates Range */}
              <div className="flex flex-col space-y-1.5 min-w-0">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dates ({tripState.totalDays} Days)</label>
                <div className="flex flex-col space-y-2 px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 w-10">START</span>
                    <input 
                      type="date" 
                      name="startDate"
                      value={tripState.startDate} 
                      onChange={handleTripSetupChange}
                      className="bg-transparent text-xs font-semibold text-gray-700 dark:text-gray-200 flex-1 focus:outline-none"
                    />
                  </div>
                  <div className="w-full h-px bg-gray-200 dark:bg-slate-700"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 w-10">END</span>
                    <input 
                      type="date" 
                      name="endDate"
                      value={tripState.endDate} 
                      onChange={handleTripSetupChange}
                      className="bg-transparent text-xs font-semibold text-gray-700 dark:text-gray-200 flex-1 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Travelers Count */}
              <div className="flex flex-col space-y-1.5 min-w-0">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Travelers</label>
                <div className="flex items-center space-x-2 px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                  <Users className="text-gray-400 w-4 h-4" />
                  <input 
                    type="number" 
                    min="1" 
                    max="15"
                    name="travelers"
                    value={tripState.travelers} 
                    onChange={handleTripSetupChange}
                    className="bg-transparent text-sm font-semibold text-gray-700 dark:text-gray-200 w-full focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Mode Selector */}
          <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-2">
            {modes.map(mode => (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-all ${
                  activeMode === mode.id 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow-sm'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  {mode.icon} {mode.label}
                </div>
                <div className="text-xs opacity-75">{mode.desc}</div>
              </button>
            ))}
          </div>

          {/* Active Mode Content */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm min-h-[500px]">
            {activeMode === 'fix-budget' && <FixBudgetTrip tripState={tripState} setTripState={setTripState} setTradeOffs={setTradeOffs} />}
            {activeMode === 'free-hand' && <FreeHandCustom tripState={tripState} setTripState={setTripState} />}
            {activeMode === 'pre-planned' && <PrePlannedPackages tripState={tripState} setTripState={setTripState} />}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Budget Tracker Sticky Bar */}
          <div className="sticky top-24">
            <BudgetBar tripState={tripState} tradeOffs={tradeOffs} setTripState={setTripState} />
            
            <div className="mt-6">
              <LocalDiscoverySidebar destination={tripState.destination} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
