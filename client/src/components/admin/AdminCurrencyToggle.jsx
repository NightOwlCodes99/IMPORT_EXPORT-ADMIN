import { useAdminCurrency } from '../../hooks/useAdminCurrency';

/**
 * Currency Toggle Button for Admin Panel
 * Switches between INR (₹) and USD ($)
 * Default: INR with K/L/Cr | USD with K/M/B
 */
const AdminCurrencyToggle = ({ className = '' }) => {
  const { toggleCurrency, isINR } = useAdminCurrency();

  return (
    <button
      onClick={toggleCurrency}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all duration-300 font-semibold text-sm ${
        isINR
          ? 'bg-gradient-to-r from-orange-500 to-amber-500 border-orange-400 text-white hover:from-orange-600 hover:to-amber-600'
          : 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 text-white hover:from-green-600 hover:to-emerald-600'
      } ${className}`}
      title={`Switch to ${isINR ? 'USD ($)' : 'INR (₹)'}`}
    >
      <span className="flex items-center gap-1.5">
        {isINR ? (
          <>
            <span className="text-lg">🇮🇳</span>
            <span>₹ INR</span>
          </>
        ) : (
          <>
            <span className="text-lg">🇺🇸</span>
            <span>$ USD</span>
          </>
        )}
      </span>
      <i className="fas fa-exchange-alt text-xs opacity-75"></i>
    </button>
  );
};

/**
 * Compact Currency Toggle for smaller spaces
 */
export const AdminCurrencyToggleCompact = ({ className = '' }) => {
  const { toggleCurrency, isINR } = useAdminCurrency();

  return (
    <button
      onClick={toggleCurrency}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 transition-all duration-300 font-bold text-xs ${
        isINR
          ? 'bg-orange-500 border-orange-400 text-white hover:bg-orange-600'
          : 'bg-green-500 border-green-400 text-white hover:bg-green-600'
      } ${className}`}
      title={`Switch to ${isINR ? 'USD ($)' : 'INR (₹)'}`}
    >
      {isINR ? '₹' : '$'}
      <i className="fas fa-sync-alt text-[10px]"></i>
    </button>
  );
};

/**
 * Currency Toggle as a Switch
 */
export const AdminCurrencySwitch = ({ className = '' }) => {
  const { toggleCurrency, isINR } = useAdminCurrency();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`text-sm font-semibold transition-colors ${isINR ? 'text-orange-600' : 'text-slate-400'}`}>
        ₹ INR
      </span>
      <button
        onClick={toggleCurrency}
        className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        style={{
          backgroundColor: isINR ? '#f97316' : '#22c55e'
        }}
      >
        <span
          className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
            isINR ? 'left-1' : 'left-8'
          }`}
        ></span>
      </button>
      <span className={`text-sm font-semibold transition-colors ${!isINR ? 'text-green-600' : 'text-slate-400'}`}>
        $ USD
      </span>
    </div>
  );
};

export default AdminCurrencyToggle;
