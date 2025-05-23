import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

import SmartRouter from './components/SmartRouter.vue'

const app = createApp(App)

app.component('SmartRouter', SmartRouter) // 👈 Register globally
app.use(router)
app.mount('#app')