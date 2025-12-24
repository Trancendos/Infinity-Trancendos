/**
 * Shared API utilities for making requests to the server
 */

/**
 * Check service health
 * @returns {Promise<Object>} Health data or null on error
 */
async function checkHealth() {
    try {
        const response = await fetch('/health');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Health check failed:', error);
        return null;
    }
}

/**
 * Load resources from the API
 * @returns {Promise<Object>} Resources data or null on error
 */
async function loadResources() {
    try {
        const response = await fetch('/api/resources');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to load resources:', error);
        return null;
    }
}

/**
 * Format uptime in human-readable format
 * @param {number} seconds - Uptime in seconds
 * @returns {string} Formatted uptime string
 */
function formatUptime(seconds) {
    const uptime = Math.floor(seconds);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const secs = uptime % 60;
    return `${hours}h ${minutes}m ${secs}s`;
}
