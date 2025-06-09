// script.js

/**
 * Updates the current time displayed in the UI.
 * This function is set to update every minute.
 *
 * If you do not see the time updating, please check your browser's
 * developer console (usually F12) for any JavaScript errors.
 * Also, ensure you are waiting at least one minute for the update to occur.
 */
function updateTime() {
    const now = new Date(); // Get the current date and time
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM'; // Determine AM or PM

    // Convert to 12-hour format (e.g., 13:00 becomes 1:00 PM)
    hours = hours % 12;
    hours = hours ? hours : 12; // If hours is 0 (midnight), make it 12

    // Add leading zero to minutes if less than 10 (e.g., 5 becomes 05)
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;

    // Construct the final time string (e.g., "5:24 PM")
    const currentTimeString = `${hours}:${strMinutes} ${ampm}`;

    // Get the DOM element where the time should be displayed
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = currentTimeString;
        // console.log(`Time updated to: ${currentTimeString}`); // Uncomment for debugging
    } else {
        console.warn("DOM element with ID 'current-time' not found. Time cannot be displayed.");
    }
}

/**
 * Updates the battery status (icon and percentage) in the UI.
 * This function utilizes the standard Battery Status API to get real-time data.
 * @param {BatteryManager} battery - The BatteryManager object from navigator.getBattery().
 */
function updateBatteryStatus(battery) {
    const batteryIcon = document.getElementById('battery-icon');
    const batteryPercentage = document.getElementById('battery-percentage');

    // Ensure UI elements are present in the DOM
    if (!batteryIcon || !batteryPercentage) {
        console.error('Battery UI elements (icon or percentage) not found in the DOM. Cannot update battery status.');
        return;
    }

    // Get the battery level as a percentage (0-100)
    const level = Math.floor(battery.level * 100);
    // Get the charging status (true/false)
    const isCharging = battery.charging;

    // Update the displayed percentage text
    batteryPercentage.textContent = `${level}%`;

    // Clear any existing Font Awesome battery icon classes and custom colors
    batteryIcon.classList.remove(
        'fa-battery-empty', 'fa-battery-quarter', 'fa-battery-half',
        'fa-battery-three-quarters', 'fa-battery-full', 'fa-bolt'
    );
    batteryIcon.style.color = ''; // Reset custom color styles

    // Apply the correct Font Awesome icon and color based on status
    if (isCharging) {
        batteryIcon.classList.add('fa-bolt'); // Display charging bolt icon
        batteryIcon.style.color = '#4CAF50'; // Green color for charging state
    } else if (level <= 10) { // Very low battery (0-10%)
        batteryIcon.classList.add('fa-battery-empty');
        batteryIcon.style.color = 'red'; // Red color for critical warning
    } else if (level <= 30) { // Low battery (11-30%)
        batteryIcon.classList.add('fa-battery-quarter');
        batteryIcon.style.color = 'orange'; // Orange for a general warning
    } else if (level <= 60) { // Medium battery (31-60%)
        batteryIcon.classList.add('fa-battery-half');
    } else if (level <= 85) { // High battery (61-85%)
        batteryIcon.classList.add('fa-battery-three-quarters');
    } else { // Full battery (86-100%)
        batteryIcon.classList.add('fa-battery-full');
    }
}

/**
 * Initializes battery status monitoring.
 * Attempts to use the Battery Status API. If available, it sets up listeners
 * for real-time updates. If not supported, it displays a fallback status.
 */
function initializeBattery() {
    // Check if the Battery Status API is supported by the current browser/environment
    if ('getBattery' in navigator) {
        navigator.getBattery().then(function(battery) {
            // Initial update of the battery status immediately on load
            updateBatteryStatus(battery);

            // Set up event listeners to continuously update the battery status
            // when the level or charging state changes.
            battery.addEventListener('levelchange', () => updateBatteryStatus(battery));
            battery.addEventListener('chargingchange', () => updateBatteryStatus(battery));
        }).catch(function(error) {
            // Handle cases where the API is present but an error occurs (e.g., permissions denied)
            console.error('Failed to access Battery Status API:', error);
            // Display a fallback "N/A" status in the UI
            const batteryStatusElement = document.getElementById('battery-status');
            if (batteryStatusElement) {
                batteryStatusElement.innerHTML = '<i class="fas fa-battery-full"></i> <span class="ml-1 text-base">N/A</span>';
                batteryStatusElement.title = 'Battery status unavailable'; // Add a helpful tooltip
            }
        });
    } else {
        // Handle cases where the Battery Status API is not supported at all
        console.warn('Battery Status API not supported in this browser/environment. Battery status will not be real-time.');
        // Display a default "N/A" status in the UI
        const batteryStatusElement = document.getElementById('battery-status');
        if (batteryStatusElement) {
            batteryStatusElement.innerHTML = '<i class="fas fa-battery-full"></i> <span class="ml-1 text-base">N/A</span>';
            batteryStatusElement.title = 'Battery status not supported'; // Add a helpful tooltip
        }
    }
}

/**
 * Main entry point for the JavaScript.
 * This function executes once the entire HTML document has been loaded and parsed
 * (due to 'defer' on the script tag).
 */
document.addEventListener('DOMContentLoaded', () => {
    // Perform an initial update of the time when the page first loads
    updateTime();
    // Initialize the battery status monitoring
    initializeBattery();

    // Set an interval to call `updateTime` every 60 seconds (1 minute).
    // This ensures the time displayed is always current.
    setInterval(updateTime, 60000); // 60000 milliseconds = 1 minute
});

/**
 * Function to simulate a blackout effect and then attempt to close the current tab.
 *
 * The blackout is achieved by transitioning a full-screen overlay from transparent to black.
 * The window.close() method is then called.
 *
 * IMPORTANT: window.close() will only work if the tab/window was opened via JavaScript (e.g., window.open()).
 * Most modern browsers prevent scripts from closing tabs that the user opened manually, for security and user experience reasons.
 *
 * This function assumes there is an HTML element with the ID 'blackoutOverlay'
 * and that CSS transitions are set up for its 'background-color' property.
 */
function turnOff() {
    const overlay = document.getElementById('blackoutOverlay');

    // 1. Activate the blackout effect
    overlay.classList.add('active'); // This triggers the CSS transition

    // 2. After the transition finishes (3 seconds as per CSS), attempt to close the tab
    setTimeout(() => {
        try {
            // Attempt to close the window
            window.close();
            console.log('Attempted to close the tab.');
        } catch (error) {
            // Log any errors if the window cannot be closed
            console.error('Could not close the tab. Reason:', error.message);
            // You could display a user-friendly message here if desired
            // For example: alert('The tab could not be closed automatically due to browser security policies.');
        }
    }, 3000); // Wait for the 3-second blackout transition to complete
}