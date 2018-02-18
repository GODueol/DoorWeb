// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'bootstrap/dist/css/bootstrap.css'

import Firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'

import App from './App'
import router from './router'

Vue.config.productionTip = false
Vue.use(BootstrapVue)
Vue.use(Firebaseui)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
