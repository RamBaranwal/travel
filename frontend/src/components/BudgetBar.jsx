import { useState } from 'react';
import { AlertCircle, TrendingDown, ArrowRight, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api/trips';

export default function BudgetBar({ tripState, tradeOffs, setTripState }) {
  const { budgetCap, totalCost } = tripState;
  const remaining = budgetCap - totalCost;
  const isOverBudget = remaining < 0;

  const percentage = Math.min(100, (totalCost / budgetCap) * 100);

  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const acceptTradeOff = (tradeOff) => {
    // Modify trip state to accept tradeoff
    setTripState(prev => {
      const newItems = prev.items.map(item => {
        if (item.name === tradeOff.originalItem && item.category === tradeOff.category) {
          return { ...item, name: tradeOff.suggestedItem, cost: tradeOff.suggestedCost };
        }
        return item;
      });
      return { ...prev, items: newItems };
    });
  };

  const handleConfirm = async () => {
    setIsSaving(true);
    setStatusMsg(null);
    try {
      const response = await fetch(`${API_URL}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripState)
      });
      if (!response.ok) throw new Error("Failed to save trip");
      setStatusMsg({ type: 'success', text: "Trip booked successfully!" });
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: "Failed to confirm booking." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Estimated Cost</h3>
          <div className="text-4xl font-extrabold tracking-tight">${totalCost.toFixed(2)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs font-medium text-slate-500 mb-1">Budget Cap</div>
          <div className="text-lg font-bold text-slate-700 dark:text-slate-300">${budgetCap.toFixed(2)}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span className={isOverBudget ? 'text-red-500' : 'text-emerald-500'}>
            {isOverBudget ? `$${Math.abs(remaining).toFixed(2)} Over Budget` : `$${remaining.toFixed(2)} Remaining`}
          </span>
          <span className="text-slate-500">{percentage.toFixed(0)}%</span>
        </div>
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-700 ${
              isOverBudget ? 'bg-red-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      {isOverBudget && tradeOffs && tradeOffs.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold text-sm">
            <AlertCircle className="w-4 h-4" /> Smart Trade-offs Available
          </div>
          
          <div className="space-y-2">
            {tradeOffs.map((t, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-red-100 dark:border-red-900/20 text-sm flex flex-col gap-2">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="line-through">{t.originalItem}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 mx-2 flex-shrink-0" />
                  <span className="font-medium text-slate-900 dark:text-white">{t.suggestedItem}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-semibold">
                    <TrendingDown className="w-3 h-3"/> Save ${t.savings.toFixed(2)}
                  </span>
                  <button 
                    onClick={() => acceptTradeOff(t)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <button 
          onClick={handleConfirm}
          disabled={!tripState.items || tripState.items.length === 0 || isSaving}
          className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving && <Loader2 className="w-5 h-5 animate-spin" />}
          {isSaving ? "Confirming..." : "Confirm Booking"}
        </button>
        {statusMsg && (
          <div className={`text-center text-sm font-bold ${statusMsg.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
            {statusMsg.text}
          </div>
        )}
      </div>
    </div>
  );
}
