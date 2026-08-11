/**
 * Currency Conversion Utilities
 * Handles price conversion between different currencies
 */

// Exchange rates relative to INR (base currency)
// Note: Prices in database are stored in INR
export const exchangeRates = {
  INR: 1,          // Indian Rupee (base)
  USD: 0.012,      // 1 INR = 0.012 USD
  AED: 0.044,      // 1 INR = 0.044 AED
  EUR: 0.011,      // 1 INR = 0.011 EUR
};

export const currencySymbols = {
  INR: '₹',
  USD: '$',
  AED: 'د.إ',
  EUR: '€',
};

export const currencyNames = {
  INR: 'Indian Rupee',
  USD: 'US Dollar',
  AED: 'UAE Dirham',
  EUR: 'Euro',
};

export const currencyOptions = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
];

/**
 * Convert price from INR to target currency
 * @param {number} priceInINR - Price in Indian Rupees
 * @param {string} targetCurrency - Target currency code (USD, AED, EUR, INR)
 * @returns {number} Converted price
 */
export const convertPrice = (priceInINR, targetCurrency = 'INR') => {
  if (!priceInINR || isNaN(priceInINR)) return 0;
  const rate = exchangeRates[targetCurrency] || 1;
  return priceInINR * rate;
};

/**
 * Convert price from selected currency back to INR (base currency)
 * @param {number} priceInCurrency - Price in the selected currency
 * @param {string} fromCurrency - Source currency code (USD, AED, EUR, INR)
 * @returns {number} Price in INR
 */
export const convertToINR = (priceInCurrency, fromCurrency = 'INR') => {
  if (!priceInCurrency || isNaN(priceInCurrency)) return 0;
  const rate = exchangeRates[fromCurrency] || 1;
  // Reverse the conversion: price / rate = INR
  return priceInCurrency / rate;
};

/**
 * Format price with currency symbol
 * @param {number} price - Price value (already converted)
 * @param {string} currencyCode - Currency code
 * @param {object} options - Formatting options
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, currencyCode = 'INR', options = {}) => {
  const { decimals = 2, showCode = false } = options;
  
  if (price === null || price === undefined || isNaN(price)) {
    return `${currencySymbols[currencyCode] || '₹'}0.00`;
  }

  const symbol = currencySymbols[currencyCode] || '₹';
  const formattedNumber = Number(price).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (showCode) {
    return `${symbol}${formattedNumber} ${currencyCode}`;
  }
  
  return `${symbol}${formattedNumber}`;
};

/**
 * Convert and format price in one step
 * @param {number} priceInINR - Original price in INR
 * @param {string} targetCurrency - Target currency code
 * @param {object} options - Formatting options
 * @returns {string} Formatted converted price
 */
export const convertAndFormatPrice = (priceInINR, targetCurrency = 'INR', options = {}) => {
  const convertedPrice = convertPrice(priceInINR, targetCurrency);
  return formatPrice(convertedPrice, targetCurrency, options);
};

/**
 * Get currency symbol for a currency code
 * @param {string} currencyCode - Currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currencyCode = 'INR') => {
  return currencySymbols[currencyCode] || '₹';
};

/**
 * Get all available currencies
 * @returns {Array} Array of currency options
 */
export const getAvailableCurrencies = () => {
  return currencyOptions;
};

export default {
  convertPrice,
  formatPrice,
  convertAndFormatPrice,
  getCurrencySymbol,
  getAvailableCurrencies,
  exchangeRates,
  currencySymbols,
  currencyNames,
  currencyOptions,
};
