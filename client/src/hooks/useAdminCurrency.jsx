import { useState, createContext, useContext } from 'react';

// Exchange rate: 1 USD = 83 INR (approximate)
const USD_TO_INR_RATE = 83;
const INR_TO_USD_RATE = 1 / USD_TO_INR_RATE;

// Admin Currency Context
export const AdminCurrencyContext = createContext();

// Get saved currency from localStorage or default to INR
const getSavedAdminCurrency = () => {
  try {
    const saved = localStorage.getItem('adminSelectedCurrency');
    if (saved === 'USD' || saved === 'INR') {
      return saved;
    }
  } catch (e) {}
  return 'INR'; // Default to INR
};

// Provider component
export const AdminCurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(getSavedAdminCurrency);

  const setCurrency = (newCurrency) => {
    if (newCurrency === 'USD' || newCurrency === 'INR') {
      setCurrencyState(newCurrency);
      try {
        localStorage.setItem('adminSelectedCurrency', newCurrency);
      } catch (e) {}
    }
  };

  const toggleCurrency = () => {
    setCurrency(currency === 'INR' ? 'USD' : 'INR');
  };

  const value = {
    currency,
    setCurrency,
    toggleCurrency,
    isINR: currency === 'INR',
    isUSD: currency === 'USD',
  };

  return (
    <AdminCurrencyContext.Provider value={value}>
      {children}
    </AdminCurrencyContext.Provider>
  );
};

// Custom hook to use admin currency
export const useAdminCurrency = () => {
  const context = useContext(AdminCurrencyContext);
  if (!context) {
    throw new Error('useAdminCurrency must be used within AdminCurrencyProvider');
  }
  return context;
};

/**
 * Format amount in Indian style with K (thousands), L (lakhs), Cr (crores)
 * @param {number} amount - Amount in INR
 * @returns {string} Formatted string like "₹1.5Cr" or "₹50L" or "₹10K"
 */
export const formatINR = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  const num = Number(amount);
  if (num < 0) return '-' + formatINR(Math.abs(num));
  
  // Crores (1 Cr = 10,000,000)
  if (num >= 10000000) {
    const cr = num / 10000000;
    return '₹' + (cr >= 100 ? cr.toFixed(0) : cr.toFixed(2).replace(/\.?0+$/, '')) + 'Cr';
  }
  // Lakhs (1 L = 100,000)
  if (num >= 100000) {
    const l = num / 100000;
    return '₹' + (l >= 100 ? l.toFixed(0) : l.toFixed(2).replace(/\.?0+$/, '')) + 'L';
  }
  // Thousands (1 K = 1,000)
  if (num >= 1000) {
    const k = num / 1000;
    return '₹' + (k >= 100 ? k.toFixed(0) : k.toFixed(2).replace(/\.?0+$/, '')) + 'K';
  }
  // Below 1000, show full number
  return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
};

/**
 * Format amount in USD with K (thousands), M (millions), B (billions)
 * @param {number} amount - Amount in USD
 * @returns {string} Formatted string like "$1.5M" or "$500K"
 */
export const formatUSD = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0';
  const num = Number(amount);
  if (num < 0) return '-' + formatUSD(Math.abs(num));
  
  // Billions
  if (num >= 1000000000) {
    const b = num / 1000000000;
    return '$' + (b >= 100 ? b.toFixed(0) : b.toFixed(2).replace(/\.?0+$/, '')) + 'B';
  }
  // Millions
  if (num >= 1000000) {
    const m = num / 1000000;
    return '$' + (m >= 100 ? m.toFixed(0) : m.toFixed(2).replace(/\.?0+$/, '')) + 'M';
  }
  // Thousands
  if (num >= 1000) {
    const k = num / 1000;
    return '$' + (k >= 100 ? k.toFixed(0) : k.toFixed(2).replace(/\.?0+$/, '')) + 'K';
  }
  // Below 1000, show full number
  return '$' + num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

/**
 * Convert amount from INR to USD
 * @param {number} amountINR - Amount in INR
 * @returns {number} Amount in USD
 */
export const convertINRtoUSD = (amountINR) => {
  if (amountINR === null || amountINR === undefined || isNaN(amountINR)) return 0;
  return Number(amountINR) * INR_TO_USD_RATE;
};

/**
 * Convert amount from USD to INR
 * @param {number} amountUSD - Amount in USD
 * @returns {number} Amount in INR
 */
export const convertUSDtoINR = (amountUSD) => {
  if (amountUSD === null || amountUSD === undefined || isNaN(amountUSD)) return 0;
  return Number(amountUSD) * USD_TO_INR_RATE;
};

/**
 * Format amount based on current currency selection
 * Assumes input is in USD (as stored in database)
 * @param {number} amountUSD - Amount in USD (from database)
 * @param {string} currency - 'INR' or 'USD'
 * @returns {string} Formatted amount string
 */
export const formatAdminAmount = (amountUSD, currency = 'INR') => {
  if (amountUSD === null || amountUSD === undefined || isNaN(amountUSD)) {
    return currency === 'INR' ? '₹0' : '$0';
  }
  
  const num = Number(amountUSD);
  
  if (currency === 'INR') {
    // Convert USD to INR and format
    const amountINR = num * USD_TO_INR_RATE;
    return formatINR(amountINR);
  } else {
    // Format as USD
    return formatUSD(num);
  }
};

/**
 * Format amount with full number (no abbreviation) based on currency
 * @param {number} amountUSD - Amount in USD (from database)
 * @param {string} currency - 'INR' or 'USD'
 * @returns {string} Formatted amount string with full number
 */
export const formatAdminAmountFull = (amountUSD, currency = 'INR') => {
  if (amountUSD === null || amountUSD === undefined || isNaN(amountUSD)) {
    return currency === 'INR' ? '₹0' : '$0';
  }
  
  const num = Number(amountUSD);
  
  if (currency === 'INR') {
    const amountINR = num * USD_TO_INR_RATE;
    return '₹' + amountINR.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  } else {
    return '$' + num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }
};

/**
 * Custom hook that returns formatting functions bound to current currency
 */
export const useAdminCurrencyFormatter = () => {
  const { currency } = useAdminCurrency();
  
  return {
    format: (amount) => formatAdminAmount(amount, currency),
    formatFull: (amount) => formatAdminAmountFull(amount, currency),
    currency,
    symbol: currency === 'INR' ? '₹' : '$',
    isINR: currency === 'INR',
    isUSD: currency === 'USD',
  };
};

export default useAdminCurrency;
