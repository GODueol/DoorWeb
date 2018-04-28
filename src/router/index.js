import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Notices from '@/components/Notice'
import Reports from '@/components/Report'
import PostReport from '@/components/PostReport'
import Suggest from '@/components/Suggest'
import Auth from '@/components/Auth'
import AuthSuccess from '@/components/AuthSuccess'

Vue.use(Router)

export default new Router({
  routes: [
    { path: '/', component: Auth },
    { path: '/auth', component: Auth },
    { path: '/success', component: AuthSuccess },
    {
      path: '/hello',
      name: 'HelloWorld',
      component: HelloWorld
    }, {
      path: '/notice',
      name: 'Notice',
      component: Notices
    }, {
      path: '/report/user',
      name: 'User Report',
      component: Reports
    }, {
      path: '/suggest',
      name: 'Suggest',
      component: Suggest
    }, {
      path: '/report/post',
      name: 'Post Report',
      component: PostReport
    }
  ],
  mode: 'history'
})
