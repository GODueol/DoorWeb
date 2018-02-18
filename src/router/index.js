import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Notices from '@/components/Notice'
import Reports from '@/components/Report'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/hello',
      name: 'HelloWorld',
      component: HelloWorld
    }, {
      path: '/notice',
      name: 'Notice',
      component: Notices
    }, {
      path: '/report',
      name: 'Report',
      component: Reports
    }
  ],
  mode: 'history'
})
