import Vue from 'vue'
import Router from 'vue-router'

import Homepage from './pages/Homepage.vue'
import CreateKey from './pages/CreateKey.vue'
import ValidateKey from './pages/ValidateKey.vue'

Vue.use(Router)

export default new Router({
  base: __dirname,
  routes: [
    {
      path: '/',
      component: Homepage,
      name: 'homepage'
    },
    {
      path: '/create',
      component: CreateKey,
      name: 'create'
    },
    {
      path: '/verify',
      component: ValidateKey,
      name: 'validate'
    }
  ]
})
