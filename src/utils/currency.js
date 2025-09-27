/**
 * Currency utility functions for the supermarket app
 */

// Default currency settings
const DEFAULT_CURRENCY = "NIS";
const DEFAULT_CURRENCY_SYMBOL = "₪";
const DEFAULT_CURRENCY_FORMAT = {
  style: "decimal",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

// Format currency with proper symbol and formatting
export const formatCurrency = (amount, currency = DEFAULT_CURRENCY, useStandardFormat = false) => {
  // Handle null, undefined, or non-numeric values
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "₪0.00"; // Use direct Unicode character
  }

  // Convert to number if it's a string
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  // Use direct Unicode character for the symbol instead of getting it dynamically
  const symbol = "₪"; // Direct Unicode for Shekel

  // Format the number without currency symbol using en-US to avoid spacing issues
  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);

  // Manually add the currency symbol at the beginning
  return `${symbol}${formattedNumber}`;
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
  // Use direct Unicode character for the symbol instead of getting it dynamically
  const symbol = "₪"; // Direct Unicode for Shekel
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) return "₪0";

  // Format the number without currency symbol using en-US to avoid spacing issues
  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);

  // Manually add the currency symbol at the beginning
  return `${symbol}${formattedNumber}`;
};
