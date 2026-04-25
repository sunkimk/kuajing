import { createApp } from 'vue'
import ArcoVue from '@arco-design/web-vue'
import '@arco-themes/vue-kjerp/css/arco.css'
import './style.css'
import App from './App.vue'
import router from './router'

createApp(App).use(ArcoVue).use(router).mount('#app')
