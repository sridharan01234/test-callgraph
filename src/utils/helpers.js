// Helper functions used across the application

/**
 * Formats a date string into a more readable format
 * @param {string} dateString - ISO format date string
 * @returns {string} Formatted date
 */
export function formatDate(dateString, test = false) {
  const date = new Date(dateString);
  console.log(date, test);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Capitalizes the first letter of each word in a string
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export function capitalizeText(text) {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Truncates text to a specified length with ellipsis
 * @param {string} text - Text to truncate  
 * @param {number} maxLength - Maximum length before truncating
 * @returns {string} Truncated text with ellipsis if needed
 */
export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}