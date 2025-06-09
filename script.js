// script.js

/**
 * Updates the current time displayed in the UI.
 * This function is set to update every minute.
 */
function updateTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;

    const currentTimeString = `${hours}:${strMinutes} ${ampm}`;
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
 * @param {BatteryManager} battery - The BatteryManager object from navigator.getBattery().
 */
function updateBatteryStatus(battery) {
    const batteryIcon = document.getElementById('battery-icon');
    const batteryPercentage = document.getElementById('battery-percentage');

    if (!batteryIcon || !batteryPercentage) {
        console.error('Battery UI elements (icon or percentage) not found in the DOM. Cannot update battery status.');
        return;
    }

    const level = Math.floor(battery.level * 100);
    const isCharging = battery.charging;

    batteryPercentage.textContent = `${level}%`;

    batteryIcon.classList.remove(
        'fa-battery-empty', 'fa-battery-quarter', 'fa-battery-half',
        'fa-battery-three-quarters', 'fa-battery-full', 'fa-bolt'
    );
    batteryIcon.style.color = '';

    if (isCharging) {
        batteryIcon.classList.add('fa-bolt');
        batteryIcon.style.color = '#4CAF50';
    } else if (level <= 10) {
        batteryIcon.classList.add('fa-battery-empty');
        batteryIcon.style.color = 'red';
    } else if (level <= 30) {
        batteryIcon.classList.add('fa-battery-quarter');
        batteryIcon.style.color = 'orange';
    } else if (level <= 60) {
        batteryIcon.classList.add('fa-battery-half');
    } else if (level <= 85) {
        batteryIcon.classList.add('fa-battery-three-quarters');
    } else {
        batteryIcon.classList.add('fa-battery-full');
    }
}

/**
 * Initializes battery status monitoring.
 */
function initializeBattery() {
    if ('getBattery' in navigator) {
        navigator.getBattery().then(function(battery) {
            updateBatteryStatus(battery);
            battery.addEventListener('levelchange', () => updateBatteryStatus(battery));
            battery.addEventListener('chargingchange', () => updateBatteryStatus(battery));
        }).catch(function(error) {
            console.error('Failed to access Battery Status API:', error);
            const batteryStatusElement = document.getElementById('battery-status');
            if (batteryStatusElement) {
                batteryStatusElement.innerHTML = '<i class="fas fa-battery-full"></i> <span class="ml-1 text-base">N/A</span>';
                batteryStatusElement.title = 'Battery status unavailable';
            }
        });
    } else {
        console.warn('Battery Status API not supported in this browser/environment. Battery status will not be real-time.');
        const batteryStatusElement = document.getElementById('battery-status');
        if (batteryStatusElement) {
            batteryStatusElement.innerHTML = '<i class="fas fa-battery-full"></i> <span class="ml-1 text-base">N/A</span>';
            batteryStatusElement.title = 'Battery status not supported';
        }
    }
}

// --- Dark/Light Mode Setter Functionality ---

// Media query to detect the user's system color scheme preference.
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

/**
 * Applies the specified theme to the document.
 * This function adds or removes the 'dark-mode' class from the <html> element
 * and stores the user's preference in localStorage for persistence across sessions.
 * @param {string} theme - The theme to apply: 'light' or 'dark'.
 */
function applyTheme(theme) {
    const htmlElement = document.documentElement;
    if (theme === 'dark') {
        htmlElement.classList.add('dark-mode');
    } else {
        htmlElement.classList.remove('dark-mode');
    }
    localStorage.setItem('themePreference', theme);
}

// --- Iframe Manager Functionality ---

// Store a reference to the currently open iframe's window
let currentIframeWindow = null;

/**
 * Creates and displays an iframe with a close button.
 * Prevents multiple iframes from being opened simultaneously.
 * @param {string} url - The URL to load inside the iframe.
 * @param {string} [iframeId='dynamic-iframe-container'] - A unique ID for the iframe container.
 */
function openIframe(url, iframeId = 'dynamic-iframe-container') {
    if (document.getElementById(iframeId)) {
        console.warn(`Iframe with ID '${iframeId}' is already open. Not opening a new one.`);
        return;
    }

    const overlay = document.createElement('div');
    overlay.id = iframeId;
    overlay.classList.add('iframe-overlay');

    const wrapper = document.createElement('div');
    wrapper.classList.add('iframe-wrapper');

    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.classList.add('iframe-content');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('title', 'External Content');

    // Store a reference to the iframe's content window
    iframe.onload = () => {
        currentIframeWindow = iframe.contentWindow;
        // After the iframe loads, send its current theme preference
        // This is crucial for synchronizing the theme of the loaded settings.html
        const currentTheme = localStorage.getItem('themePreference') || (prefersDarkScheme.matches ? 'dark' : 'light');
        if (currentIframeWindow) { // Ensure window exists before posting message
             currentIframeWindow.postMessage({ type: 'parentTheme', theme: currentTheme }, '*');
        }
    };


    const closeButton = document.createElement('button');
    closeButton.classList.add('iframe-close-btn');
    closeButton.innerHTML = '&times;';
    closeButton.setAttribute('aria-label', 'Close Iframe');

    closeButton.addEventListener('click', () => {
        closeIframe(iframeId);
    });

    wrapper.appendChild(iframe);
    wrapper.appendChild(closeButton);
    overlay.appendChild(wrapper);
    document.body.appendChild(overlay);

    iframe.focus();
}

/**
 * Closes and removes a specific iframe overlay from the DOM.
 * @param {string} [iframeId='dynamic-iframe-container'] - The ID of the iframe container to close.
 */
function closeIframe(iframeId = 'dynamic-iframe-container') {
    const overlay = document.getElementById(iframeId);
    if (overlay) {
        overlay.remove();
        console.log(`Iframe with ID '${iframeId}' closed successfully.`);
        currentIframeWindow = null; // Clear the reference
    } else {
        console.warn(`Iframe with ID '${iframeId}' not found for closing. It might already be closed.`);
    }
}

// --- Main Entry Point: Execute on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize time display
    updateTime();
    setInterval(updateTime, 60000);

    // 2. Initialize battery status monitoring
    initializeBattery();

    // 3. Initialize theme application based on localStorage or system preference
    const storedTheme = localStorage.getItem('themePreference');
    if (storedTheme) {
        applyTheme(storedTheme);
    } else if (prefersDarkScheme.matches) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }
    // Listen for system theme changes, but only if no explicit user preference is set
    prefersDarkScheme.addEventListener("change", (event) => {
        if (!localStorage.getItem('themePreference')) {
             applyTheme(event.matches ? 'dark' : 'light');
        }
    });

    // --- Listen for messages from iframes (e.g., settings.html) ---
    window.addEventListener('message', (event) => {
        // Ensure the message comes from a trusted origin, especially in production
        // For local files, event.origin will be "null" or "file://", which is tricky to validate
        // For web servers, it will be the actual URL (e.g., "http://localhost:8000")
        // In this example, we accept all origins for simplicity with local files.

        const message = event.data;

        if (message && message.type === 'themeChanged') {
            console.log(`Main page received theme changed message from iframe: ${message.theme}`);
            applyTheme(message.theme); // Apply the theme received from the iframe
        }
        // You can add more message types here as your application grows
        // else if (message && message.type === 'settingSelected') {
        //     console.log(`Setting selected in iframe: ${message.settingId}`);
        //     // Potentially update main UI based on selected setting in iframe
        // }
    });

    // --- Example: Trigger iframe when the settings navigation button is clicked ---
    const settingsNavButton = document.querySelector('.nav-button i.fa-cog');
    if (settingsNavButton && settingsNavButton.parentElement) {
        settingsNavButton.parentElement.addEventListener('click', () => {
            console.log("Settings navigation button clicked. Opening settings.html.");
            openIframe('settings.html');
        });
    } else {
        console.warn("Settings navigation button (or its parent) not found. Iframe trigger not set up.");
    }
});
