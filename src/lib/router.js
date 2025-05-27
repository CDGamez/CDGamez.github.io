import { writable } from 'svelte/store';

// Current path store (reactive)
export const currentPath = writable(window.location.pathname);

// Auto-import all route components in /routes
const routeModules = import.meta.glob('../routes/*.svelte', { eager: true });

// Build route map: { "/about": AboutComponent, ... }
export const routes = {};
for (const path in routeModules) {
  const routePath = path
    .replace('../routes', '')
    .replace('.svelte', '')
    .toLowerCase();

  const mod = routeModules[path];
  routes[routePath === '/home' || routePath === '/index' ? '/' : routePath] =
    (mod && typeof mod === 'object' && 'default' in mod ? mod.default : undefined);
}

// Fallback component
export const NotFound = {
  render() {
    return '404 Not Found';
  }
};

// Navigation
export function navigate(path) {
  history.pushState({}, '', path);
  updateRoute();
}

// Update current route component
export let currentComponent;
export function updateRoute() {
  const path = window.location.pathname;
  currentPath.set(path);
  currentComponent = routes[path] || NotFound;
}

// Init router (listen to browser nav)
export function initRouter() {
  updateRoute();
  window.addEventListener('popstate', updateRoute);
}
