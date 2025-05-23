/**
 * Utilities Module
 * 
 * Provides utility functions for the step-by-step ECS test.
 */

/**
 * Generate a random color
 * @returns {string} A random color in hex format
 */
export function getRandomColor() {
    const colors = [
        '#e74c3c', // Red
        '#3498db', // Blue
        '#2ecc71', // Green
        '#f39c12', // Orange
        '#9b59b6', // Purple
        '#1abc9c', // Teal
        '#d35400'  // Dark Orange
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Format a number to a fixed number of decimal places
 * @param {number} value - The number to format
 * @param {number} [decimals=2] - The number of decimal places
 * @returns {string} The formatted number
 */
export function formatNumber(value, decimals = 2) {
    return Number(value).toFixed(decimals);
}

/**
 * Convert radians to degrees
 * @param {number} radians - The angle in radians
 * @returns {number} The angle in degrees
 */
export function toDegrees(radians) {
    return radians * (180 / Math.PI);
}

/**
 * Convert degrees to radians
 * @param {number} degrees - The angle in degrees
 * @returns {number} The angle in radians
 */
export function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}
