// Define <router-link> custom element
class RouterLink extends HTMLElement {
  connectedCallback() {
    const to = this.getAttribute('to');
    const label = this.innerHTML || to;
    this.innerHTML = `<a href="${to}" class="router-link">${label}</a>`;

    this.querySelector('a').addEventListener('click', e => {
      e.preventDefault();
      history.pushState(null, '', to);
      navigate(to);
    });
  }
}
customElements.define('router-link', RouterLink);

// Load and initialize router
fetch('routes.json')
  .then(res => {
    if (!res.ok) throw new Error(`Could not load routes.json`);
    return res.json();
  })
  .then(routes => {
    window.routes = routes;
    navigate(location.pathname); // Replaces the missing setupRouter()
  })
  .catch(err => {
    console.error(err);
    document.querySelector('main').innerHTML = '<h1>Error loading routes</h1>';
  });

// Navigate to a given path
function navigate(path) {
  const clean = path.replace(/^\/|\/$/g, '') || 'home';

  if (!window.routes || !window.routes.includes(clean)) {
    document.querySelector('main').innerHTML = '<h1>404 - Not Found</h1>';
    return;
  }

  fetch(`routes/${clean}.html`)
    .then(res => {
      if (!res.ok) throw new Error(`Failed to fetch /routes/${clean}.html`);
      return res.text();
    })
    .then(html => {
      document.querySelector('main').innerHTML = html;
    })
    .catch(err => {
      console.error(err);
      document.querySelector('main').innerHTML = '<h1>Error loading page</h1>';
    });
}

// Handle back/forward browser navigation
window.onpopstate = () => navigate(location.pathname);
