// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'bootstrap/dist/css/bootstrap.css'

import firebase from 'firebase'
import 'firebaseui/dist/firebaseui.css'

import App from './App'
import router from './router'


Vue.config.productionTip = false
Vue.use(BootstrapVue)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  created: function () {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.$router.push('/notice')
      } else {
        this.$router.push('/auth')
      }
    })
  },
  render: h => h(App)
})
