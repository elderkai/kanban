import Loading from './components/Loading.vue'
import { createApp } from 'vue'
export default {
  mounted(el:any, binding:any) {
    console.log(el,binding);
    
    const app = createApp(Loading, {
      visible: binding.value,
      target: el,
      background: binding.modifiers.body ? 'rgba(0,0,0,0.5)' : ''
    })
    el.instance = app.mount(document.createElement('div'))
    if (binding.value) el.appendChild(el.instance.$el)
  },
  updated(el:any, binding:any) {
    if (binding.value !== binding.oldValue) {
      binding.value 
        ? el.appendChild(el.instance.$el) 
        : el.removeChild(el.instance.$el)
    }
  }
}
