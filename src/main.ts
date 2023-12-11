import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { registerMicroApps, start } from 'qiankun';
import apps from "@/app/index"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
const app = createApp(App)
registerMicroApps(apps)
start()

app.use(createPinia())
app.use(ElementPlus)
app.use(router)

app.mount('#app')
