import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Wallet, MapPin, Calendar, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [budget, setBudget] = useState(1500);
  const [hotelTier, setHotelTier] = useState('Standard');

  // Interactive mock widget logic
  const hotelCosts = { Budget: 400, Standard: 800, Luxury: 1400 };
  const baseCost = 200; // flights/transit
  const remaining = budget - (hotelCosts[hotelTier] + baseCost);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Navbar */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold tracking-tighter text-slate-900 dark:text-white flex items-center gap-2">
          <MapPin className="text-blue-600 w-6 h-6" />
          VoyageCraft
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-sm font-medium hover:text-blue-600 transition-colors"
        >
          Go to Dashboard
        </button>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-20 pb-32 grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Real-time dynamic trip planning
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Stop guessing.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Start exploring.
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
            Fix your budget and let us build the perfect trip, or take complete control with modular planning. Authentic local experiences included.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
            >
              Start Custom Journey <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-6 pt-8 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Smart trade-offs</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Hyper-local discovery</div>
          </div>
        </div>

        {/* Interactive Product Preview Card */}
        <div className="relative z-10 w-full max-w-md mx-auto">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 blur-3xl -z-10 rounded-full"></div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-600"/> 
                Live Budget Tracker
              </h3>
              <div className="text-right">
                <div className="text-xs text-slate-500">Total Cap</div>
                <div className="font-bold text-xl">${budget}</div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Hotel Tier Toggle */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
                  Accommodation Tier
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  {['Budget', 'Standard', 'Luxury'].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setHotelTier(tier)}
                      className={`py-2 text-sm font-medium rounded-lg transition-all ${
                        hotelTier === tier 
                          ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' 
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expense Breakdown */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4"/> Flights & Transit</span>
                  <span className="font-medium">${baseCost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-2"><MapPin className="w-4 h-4"/> {hotelTier} Stay</span>
                  <span className="font-medium">${hotelCosts[hotelTier]}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="pt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Remaining Budget</span>
                  <span className={`font-bold ${remaining < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    ${remaining}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      remaining < 0 ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, ((budget - remaining) / budget) * 100)}%` }}
                  ></div>
                </div>
                {remaining < 0 && (
                  <p className="text-xs text-red-500 mt-2 animate-pulse">
                    ⚠️ Over budget! Swap to a cheaper tier to save ${Math.abs(remaining)}.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
