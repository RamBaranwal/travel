import { useState, useEffect } from 'react';
import { Compass, Palmtree, Utensils, Brush, Sparkles } from 'lucide-react';

export default function LocalDiscoverySidebar({ destination }) {
  // In a real app, this would fetch from /api/trips/catalog?destination=...
  const indiaCatalog = {
    'Ladakh, India': [
      { name: 'SECMOL Solar Campus', category: 'hidden-gem', cost: 5, rating: 4.8 },
      { name: 'Apricot Orchard Visit', category: 'local-food', cost: 10, rating: 4.7 },
      { name: 'Pashmina Weaving', category: 'artisan', cost: 20, rating: 4.9 },
    ],
    'Kolkata, India': [
      { name: 'Kumartuli Idol Makers', category: 'artisan', cost: 2, rating: 4.8 },
      { name: 'College St Coffee House', category: 'local-food', cost: 5, rating: 4.6 },
      { name: 'South Park Street Cemetery', category: 'hidden-gem', cost: 1, rating: 4.7 },
    ],
    'Goa, India': [
      { name: 'Divar Island Ferry', category: 'hidden-gem', cost: 2, rating: 4.7 },
      { name: 'Feni Distillery Tour', category: 'local-food', cost: 15, rating: 4.9 },
      { name: 'Azulejos Tile Painting', category: 'artisan', cost: 25, rating: 4.8 },
    ]
  };
  const mockCatalog = indiaCatalog[destination] || indiaCatalog['Ladakh, India'];

  const getIcon = (category) => {
    switch(category) {
      case 'hidden-gem': return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'local-food': return <Utensils className="w-4 h-4 text-orange-500" />;
      case 'artisan': return <Brush className="w-4 h-4 text-pink-500" />;
      default: return <Compass className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="bg-slate-900 dark:bg-slate-950 rounded-3xl p-6 shadow-lg text-white">
      <div className="flex items-center gap-2 mb-4">
        <Palmtree className="w-5 h-5 text-emerald-400" />
        <h3 className="font-semibold text-lg">Hyper-Local</h3>
      </div>
      <p className="text-sm text-slate-400 mb-6">Support community tourism in {destination}</p>
      
      <div className="space-y-4">
        {mockCatalog.map((item, idx) => (
          <div key={idx} className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-2xl p-4 transition-colors cursor-pointer group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 font-medium text-sm">
                {getIcon(item.category)}
                <span className="group-hover:text-blue-400 transition-colors">{item.name}</span>
              </div>
              <div className="text-xs font-bold">${item.cost.toFixed(2)}</div>
            </div>
            <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
              <span className="uppercase tracking-wider">{item.category.replace('-', ' ')}</span>
              <span className="flex items-center gap-1">★ {item.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
