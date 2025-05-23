import { ref, computed, defineAsyncComponent } from 'vue'

const currentPage = ref('Home') // default
const modules = import.meta.glob('../routes/*.vue')

const components = {}
for (const path in modules) {
  const name = path.split('/').pop().replace('.vue', '')
  components[name] = modules[path]
}

const currentComponent = computed(() =>
  defineAsyncComponent(components[currentPage.value] || components['Home'])
)

function setPage(name) {
  if (components[name]) currentPage.value = name
}

export function usePage() {
  return { currentPage, currentComponent, setPage }
}
