import { createApp, h, render } from 'vue'
import Loading from './components/Loading.vue'


export default {
  service(options = {} as any) {
    let container = options.target || document.body
    const instance = createApp({
      render() {
        return h(Loading, { 
          visible: true,
          text: options.text,
          background: options.background,
          lock: options.lock,
          customIcon: options.customIcon 
        })
      }
    })

    const loadingEl = document.createElement('div')
    container.appendChild(loadingEl)
    const vm = instance.mount(loadingEl)

    return {
      close: () => {
        container.removeChild(loadingEl)
        instance.unmount()
      }
    }
  }
}
