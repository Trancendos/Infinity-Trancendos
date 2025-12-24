/**
 * Shared utility functions for API calls and error handling
 */

/**
 * Generic fetch wrapper with error handling
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options
 * @returns {Promise<object>} - The response data
 */
async function fetchWithErrorHandling(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch ${url}:`, error);
        throw error;
    }
}

/**
 * Update a status badge element
 * @param {string} elementId - The badge element ID
 * @param {string} text - Badge text
 * @param {string} status - Status class (healthy, checking, unhealthy)
 */
function updateStatusBadge(elementId, text, status) {
    const badge = document.getElementById(elementId);
    if (badge) {
        badge.textContent = text;
        badge.className = `status-badge ${status}`;
    }
}

/**
 * Display error in a metrics container
 * @param {string} elementId - The container element ID
 * @param {Error} error - The error to display
 */
function displayError(elementId, error) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="error">
                <strong>Error:</strong> ${error.message}
            </div>
        `;
    }
}

/**
 * Format uptime seconds to human readable string
 * @param {number} seconds - Uptime in seconds
 * @returns {string} - Formatted uptime string
 */
function formatUptime(seconds) {
    const uptime = Math.floor(seconds);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const secs = uptime % 60;
    return `${hours}h ${minutes}m ${secs}s`;
}
