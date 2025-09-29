import loading from './loading'
import service from './service'

export default {
  install(app:any) {
    app.directive('loading', loading)
    app.config.globalProperties.$loading = service
  }
}
