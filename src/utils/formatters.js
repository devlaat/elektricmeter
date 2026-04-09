/**
 * Format a number to a specified number of significant figures
 * @param {number} value - The value to format
 * @param {number} sigFigs - Number of significant figures (default: 4)
 * @returns {string} - Formatted number string
 */
export const formatSignificantFigures = (value, sigFigs = 4) => {
  if (value == null || isNaN(value)) return "—";
  
  const num = Math.abs(value);
  
  // Handle zero
  if (num === 0) return "0";
  
  // Calculate the magnitude
  const magnitude = Math.floor(Math.log10(num));
  const scale = Math.pow(10, sigFigs - magnitude - 1);
  const rounded = Math.round(num * scale) / scale;
  
  // Determine decimal places needed
  const decimalPlaces = Math.max(0, sigFigs - magnitude - 1);
  
  return (value < 0 ? "-" : "") + rounded.toFixed(decimalPlaces);
};

/**
 * Format number with locale and specific decimal places
 * @param {number} value - The value to format
 * @param {number} decimals - Number of decimal places
 * @param {string} locale - Locale for formatting (default: 'es-BO')
 * @returns {string} - Formatted number string
 */
export const formatNumber = (value, decimals = 0, locale = "es-BO") => {
  if (value == null || isNaN(value)) return "—";
  return Number(value).toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format energy consumption with proper units
 * @param {number} kw - Power in kilowatts
 * @returns {string} - Formatted string with appropriate unit
 */
export const formatEnergy = (kw) => {
  if (kw == null || isNaN(kw)) return "—";
  
  if (kw >= 1) {
    return `${formatSignificantFigures(kw, 4)} kW`;
  } else if (kw >= 0.001) {
    return `${formatSignificantFigures(kw * 1000, 4)} W`;
  } else {
    return `${formatSignificantFigures(kw * 1000000, 4)} mW`;
  }
};

/**
 * Get trend information (increase/decrease)
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {object} - { trend: 'up'|'down'|'stable', percentage: number }
 */
export const getTrend = (current, previous) => {
  if (!current || !previous || isNaN(current) || isNaN(previous)) {
    return { trend: "stable", percentage: 0 };
  }
  
  const change = ((current - previous) / previous) * 100;
  
  if (Math.abs(change) < 1) {
    return { trend: "stable", percentage: 0 };
  }
  
  return {
    trend: change > 0 ? "up" : "down",
    percentage: Math.abs(Math.round(change * 10) / 10),
  };
};

/**
 * Format timestamp to readable format
 * @param {string|Date} timestamp - The timestamp
 * @returns {string} - Formatted time string
 */
export const formatTime = (timestamp) => {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  return date.toLocaleTimeString("es-BO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

/**
 * Format date and time
 * @param {string|Date} timestamp - The timestamp
 * @returns {string} - Formatted datetime string
 */
export const formatDateTime = (timestamp) => {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  return date.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }) + " " + formatTime(timestamp);
};
