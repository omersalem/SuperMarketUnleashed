/**
 * Currency utility functions for the supermarket app
 */

// Default currency settings
const DEFAULT_CURRENCY = "NIS";
const DEFAULT_CURRENCY_SYMBOL = "₪";
const DEFAULT_CURRENCY_FORMAT = {
  style: "currency",
  currency: DEFAULT_CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

// Format currency with proper symbol and formatting
export const formatCurrency = (amount, currency = DEFAULT_CURRENCY) => {
  // Handle null, undefined, or non-numeric values
  if (amount === null || amount === undefined || isNaN(amount)) {
    return DEFAULT_CURRENCY_SYMBOL + "0.00";
  }

  // Convert to number if it's a string
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  // Return formatted currency
  return new Intl.NumberFormat("he-IL", {
    ...DEFAULT_CURRENCY_FORMAT,
    currency,
  }).format(numericAmount);
};

// Get currency symbol based on currency code
export const getCurrencySymbol = (currency = DEFAULT_CURRENCY) => {
  const currencySymbols = {
    NIS: "₪",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CAD: "C$",
    AUD: "A$",
    CHF: "Fr",
    CNY: "¥",
    RUB: "₽",
  };

  return currencySymbols[currency] || DEFAULT_CURRENCY_SYMBOL;
};

// Format currency with custom symbol
export const formatCurrencyWithSymbol = (amount, currency = DEFAULT_CURRENCY) => {
  const symbol = getCurrencySymbol(currency);
  const formattedAmount = formatCurrency(amount, currency).replace(currency, "").trim();
  return `${symbol}${formattedAmount}`;
};

// Convert amount between currencies (placeholder function)
// In a real app, this would use an API or stored exchange rates
export const convertCurrency = (amount, fromCurrency, toCurrency, exchangeRates) => {
  if (fromCurrency === toCurrency) return amount;

  // For demo purposes, we'll use a simple conversion
  // In production, you would use proper exchange rates
  const conversionRate = exchangeRates?.[`${fromCurrency}_${toCurrency}`] || 1;

  return amount * conversionRate;
};

// Get all supported currencies
export const getSupportedCurrencies = () => [
  { code: "NIS", name: "Israeli New Shekel", symbol: "₪" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
];

// Check if an amount is valid (not negative, not zero for certain operations)
export const isValidAmount = (amount, allowZero = true) => {
  if (typeof amount !== "number") return false;
  if (amount < 0) return false;
  if (!allowZero && amount === 0) return false;
  return true;
};

// Calculate percentage of an amount
export const calculatePercentage = (amount, percentage) => {
  return (amount * percentage) / 100;
};

// Format currency for display in tables (more compact)
export const formatCurrencyForTable = (amount, currency = DEFAULT_CURRENCY) => {
  const symbol = getCurrencySymbol(currency);
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) return `${symbol}0`;

  return `${symbol}${numericAmount.toFixed(2)}`;
};
