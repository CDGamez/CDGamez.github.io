// router.js

(function() {
    const mainContent = document.getElementById('main-content');
    let routes = {};

    // Function to load route data from 'routes.json'
    async function loadRoutes() {
        try {
            const response = await fetch('/routes.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            routes = await response.json();
            console.log('Routes loaded:', routes);
        } catch (error) {
            console.error('Failed to load routes.json:', error);
            // Fallback to minimal routes if routes.json cannot be loaded
            routes = {
                "/": { "templatePath": "pages/home.html", "title": "Home" },
                "/": { "templatePath": "pages/settings.html", "title": "Settings" },
                "/404": { "templatePath": "pages/404.html", "title": "Page Not Found" }
            };
            // Attempt to navigate to the 404 page if initial route loading fails
            // This might trigger another loading state, but will eventually show an error or 404 content
            navigate('/404', false);
        }
    }

    // Function to navigate to a new page
    // Expose navigate globally so HTML onclicks can use it.
    // This is a fallback/convenience for buttons; router.js's event listener for <a> tags is primary.
    window.navigate = async function(path, pushState = true) {

        const route = routes[path] || routes["/404"]; // Get the route object, default to 404
        const templatePath = route.templatePath;
        const pageTitle = route.title || 'CDGamez';
        const pageDescription = route.description || 'Welcome to CDGamez!';
        const handlerCode = route.handler; // The JavaScript code to execute after page load

        try {
            // Fetch the HTML content for the selected route
            const response = await fetch(templatePath);
            if (!response.ok) {
                // If specific template not found (e.g., 404 for a content page),
                // try to load the general 404 page content from routes["/404"]
                const fallback404Response = await fetch(routes["/404"].templatePath);
                if (fallback404Response.ok) {
                    mainContent.innerHTML = await fallback404Response.text();
                    document.title = routes["/404"].title;
                } else {
                    // If even the 404 page content can't be loaded, show a generic error
                    mainContent.innerHTML = '<h1>Error loading page</h1><p>The requested page and the 404 page could not be loaded.</p>';
                    document.title = 'Error';
                }
                // Still update history for the path that caused the error, if applicable
                if (pushState) {
                    window.history.pushState({ path }, pageTitle, path);
                }
                console.error(`Failed to load ${templatePath}: ${response.status} ${response.statusText}`);
                return; // Exit function after handling error
            }

            // If successful, update the main content area
            const html = await response.text();
            mainContent.innerHTML = html;
            document.title = pageTitle;

            // Update meta description for SEO/social sharing
            document.querySelector('meta[name="description"]').setAttribute('content', pageDescription);

            // Update browser history (unless it's a popstate event)
            if (pushState) {
                window.history.pushState({ path }, pageTitle, path);
            }

            // Execute post-load handler if present (e.g., for page-specific JS)
            if (handlerCode && typeof handlerCode === 'string') {
                try {
                    // eval() is used here for dynamic execution of strings from routes.json.
                    // Exercise caution: Ensure routes.json is a trusted, controlled file.
                    eval(handlerCode);
                } catch (handlerError) {
                    console.error(`Error executing handler for ${path}:`, handlerError);
                }
            }

            // Scroll to the top of the main content area for a consistent user experience
            mainContent.scrollTop = 0;

        } catch (error) {
            // Catch any unexpected errors during the fetch or DOM manipulation
            console.error('Navigation error:', error);
            mainContent.innerHTML = '<h1>Error</h1><p>Failed to load the page.</p>';
            document.title = 'Error';
            if (pushState) {
                window.history.pushState({ path }, 'Error', path);
            }
        }
        // No explicit hideLoading here, as content replacement automatically hides the spinner.
    };

    // Event listener for browser back/forward buttons
    window.addEventListener('popstate', (event) => {
        // If history state has a path, navigate to it without pushing a new state
        if (event.state && event.state.path) {
            navigate(event.state.path, false);
        } else {
            // For initial page load or when state is null (e.g., refreshing on root)
            navigate(window.location.pathname, false);
        }
    });

    // Event listener for initial page load
    window.addEventListener('DOMContentLoaded', async () => {
        await loadRoutes(); // Ensure routes are loaded before initial navigation
        navigate(window.location.pathname, false); // Navigate to the current URL path
    });

    // Universal click handler for all <a> tags to enable client-side navigation
    document.addEventListener('click', (event) => {
        const { target } = event;
        // Find the closest anchor tag ancestor
        const anchor = target.closest('a');

        // Check if it's an internal link and not intended for a new tab/window
        if (anchor && anchor.origin === window.location.origin && anchor.target !== '_blank' && !anchor.href.startsWith('mailto:') && !anchor.href.startsWith('tel:')) {
            const path = anchor.pathname;
            // Prevent default browser navigation (full page reload)
            event.preventDefault();
            // Use our custom navigate function
            navigate(path);
        }
    });

})();
