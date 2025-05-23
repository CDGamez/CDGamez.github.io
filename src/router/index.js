import { createRouter, createWebHistory } from 'vue-router'
import AppView from '../AppView.vue'

// Auto-import all .vue files in routes/
const pageModules = import.meta.glob('../routes/*.vue')

const dynamicRoutes = Object.keys(pageModules).map((path) => {
  const name = path.split('/').pop().replace('.vue', '')
  return {
    path: `/${name.toLowerCase()}`, // optional: unused here
    name,
    component: AppView, // all routes use AppView wrapper
  }
})

// Main route (we use only '/')
const routes = [
  {
    path: '/',
    name: 'Main',
    component: AppView,
  },
  // Optional: preload other paths to avoid 404s (all redirect to /)
  ...dynamicRoutes.map((r) => ({
    path: `/${r.name.toLowerCase()}`,
    redirect: '/',
  })),
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
