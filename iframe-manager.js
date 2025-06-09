// Add these functions to your existing script.js file

/**
 * Creates and displays an iframe with a close button.
 * Prevents multiple iframes from being opened simultaneously.
 * @param {string} url - The URL to load inside the iframe. This can be a relative path
 * (e.g., 'settings.html') or an absolute URL (e.g., 'https://example.com/page.html').
 * @param {string} [iframeId='dynamic-iframe-container'] - A unique ID for the iframe container.
 */
function openIframe(url, iframeId = 'dynamic-iframe-container') {
    // Check if an iframe with this ID is already open to prevent duplicates
    if (document.getElementById(iframeId)) {
        console.warn(`Iframe with ID '${iframeId}' is already open. Not opening a new one.`);
        return;
    }

    // 1. Create the main overlay container that covers the entire viewport
    const overlay = document.createElement('div');
    overlay.id = iframeId;
    overlay.classList.add('iframe-overlay');

    // 2. Create an inner wrapper for the iframe and its close button.
    // This allows for cleaner positioning of the close button relative to the iframe.
    const wrapper = document.createElement('div');
    wrapper.classList.add('iframe-wrapper');

    // 3. Create the actual iframe element
    const iframe = document.createElement('iframe');
    iframe.src = url; // Set the source URL (relative paths are resolved by the browser)
    iframe.classList.add('iframe-content');
    iframe.setAttribute('allowfullscreen', ''); // Allows content inside iframe to go fullscreen
    iframe.setAttribute('frameborder', '0'); // Removes default border
    iframe.setAttribute('title', 'External Content'); // Essential for accessibility

    // 4. Create the close button for the iframe
    const closeButton = document.createElement('button');
    closeButton.classList.add('iframe-close-btn');
    closeButton.innerHTML = '&times;'; // HTML entity for 'x' symbol
    closeButton.setAttribute('aria-label', 'Close Iframe'); // Important for accessibility

    // Add click event listener to the close button to remove the iframe
    closeButton.addEventListener('click', () => {
        closeIframe(iframeId);
    });

    // 5. Assemble the elements:
    // The wrapper contains the iframe and its close button.
    wrapper.appendChild(iframe);
    wrapper.appendChild(closeButton);
    // The overlay contains the wrapper.
    overlay.appendChild(wrapper);
    // Add the entire overlay structure to the document body, making it visible.
    document.body.appendChild(overlay);

    // Optional: Focus the iframe for better user experience after it opens.
    // This allows keyboard interaction to go directly to the iframe content.
    iframe.focus();
}

/**
 * Closes and removes a specific iframe overlay from the DOM.
 * @param {string} [iframeId='dynamic-iframe-container'] - The ID of the iframe container to close.
 */
function closeIframe(iframeId = 'dynamic-iframe-container') {
    const overlay = document.getElementById(iframeId);
    if (overlay) {
        overlay.remove(); // Remove the element (and all its children) from the DOM
        console.log(`Iframe with ID '${iframeId}' closed successfully.`);
    } else {
        console.warn(`Iframe with ID '${iframeId}' not found for closing. It might already be closed.`);
    }
}

// --- Example of how to trigger openIframe from your existing setup ---
// This part should be integrated into your main DOMContentLoaded listener in script.js.
// If you uncomment this, ensure 'settings.html' exists in your project root.

document.addEventListener('DOMContentLoaded', () => {
    // Example: Trigger iframe when a specific navigation button is clicked
    // Assuming you have a navigation button with an icon like 'fas fa-cog' for settings.
    const settingsNavButton = document.querySelector('.nav-button .fa-cog');
    if (settingsNavButton && settingsNavButton.parentElement) {
        settingsNavButton.parentElement.addEventListener('click', () => {
            console.log("Settings navigation button clicked. Opening settings.html.");
            openIframe('settings.html'); // Call openIframe with your desired local file or URL
        });
    } else {
        console.warn("Settings navigation button (or its parent) not found. Iframe trigger not set up.");
    }

    // You can also call openIframe from any other event,
    // e.g., a game event, a timer, or another custom element.
    // Example: Automatically open an iframe after 5 seconds (for demonstration)
    // setTimeout(() => {
    //     console.log("Opening a demo iframe after 5 seconds.");
    //     openIframe('https://www.example.com/some_page_that_allows_embedding.html'); // Replace with a URL that allows embedding
    // }, 5000);
});
