import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Notices from '@/components/Notice'
import UserReports from '@/components/UserReport'
import PostReport from '@/components/PostReport'
import Suggest from '@/components/Suggest'
import Auth from '@/components/Auth'
import AuthSuccess from '@/components/AuthSuccess'
import UserPrevent from '@/components/UserPrevent'
import PostPrevent from '@/components/PostPrevent'
import AdminAccount from '@/components/AdminAccount'

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
      component: UserReports
    }, {
      path: '/suggest',
      name: 'Suggest',
      component: Suggest
    }, {
      path: '/report/post',
      name: 'Post Report',
      component: PostReport
    }, {
      path: '/prevent/user',
      name: 'User Prevent',
      component: UserPrevent
    }, {
      path: '/prevent/post',
      name: 'Post Prevent',
      component: PostPrevent
    }, {
      path: '/account/admin',
      name: 'Add Admin',
      component: AdminAccount
    }
  ],
  mode: 'history'
})
