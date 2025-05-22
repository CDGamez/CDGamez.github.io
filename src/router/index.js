import { createRouter, createWebHistory } from 'vue-router'

const routeModules = import.meta.glob('../routes/*.vue')

const routes = Object.entries(routeModules).map(([path, component]) => {
  const fileName = path.split('/').pop().replace('.vue', '')
  return {
    path: `/${fileName.toLowerCase()}`,
    name: fileName,
    component: component, // This is correct, as Vite's import.meta.glob returns a function
  }
})

// Optionally add a default route
routes.push({
  path: '/',
  redirect: '/home'
})

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
