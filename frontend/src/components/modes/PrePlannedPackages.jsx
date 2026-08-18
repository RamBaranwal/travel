import { Package as PackageIcon, Check } from 'lucide-react';

export default function PrePlannedPackages({ tripState, setTripState }) {
  const packages = [
    {
      id: 'p1',
      title: 'Kyoto Traditional Escape',
      desc: 'A deeply cultural journey through temples and artisan workshops.',
      cost: 1200,
      days: 5,
      tier: 'Standard'
    },
    {
      id: 'p2',
      title: 'Bali Backpacker Discovery',
      desc: 'Experience authentic community culture and nature.',
      cost: 450,
      days: 7,
      tier: 'Budget'
    },
    {
      id: 'p3',
      title: 'Swiss Alps Luxury',
      desc: 'Premium ski resort experience with private transfers.',
      cost: 3500,
      days: 4,
      tier: 'Luxury'
    }
  ];

  const handleSelect = (pkg) => {
    setTripState(prev => ({
      ...prev,
      items: [{ id: pkg.id, name: pkg.title, category: 'package', cost: pkg.cost }]
    }));
  };

  const isSelected = (id) => tripState.items.some(i => i.id === id);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-lg mx-auto">
        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <PackageIcon className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Pre-Planned Packages</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Curated, ready-to-go itineraries. One click and your entire trip is sorted.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {packages.map(pkg => (
          <div 
            key={pkg.id}
            onClick={() => handleSelect(pkg)}
            className={`relative p-6 rounded-3xl border-2 cursor-pointer transition-all ${
              isSelected(pkg.id)
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10'
                : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300'
            }`}
          >
            {isSelected(pkg.id) && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                <Check className="w-4 h-4" />
              </div>
            )}
            <div className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
              {pkg.tier}
            </div>
            <h3 className="text-xl font-bold mb-2">{pkg.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 min-h-[40px]">{pkg.desc}</p>
            
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 mt-auto">
              <div className="text-sm font-medium">{pkg.days} Days</div>
              <div>
                <div className="text-2xl font-black text-right">${(pkg.cost * tripState.travelers).toFixed(2)}</div>
                <div className="text-xs text-slate-500 font-medium text-right">${pkg.cost.toFixed(2)} pp x {tripState.travelers}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
