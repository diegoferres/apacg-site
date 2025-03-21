
import { createRouter, createWebHistory } from 'vue-router'
import Index from '../pages/Index.vue'
import BenefitDetail from '../pages/BenefitDetail.vue'
import Login from '../pages/Login.vue'
import NotFound from '../pages/NotFound.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index
    },
    {
      path: '/beneficio/:id',
      name: 'BenefitDetail',
      component: BenefitDetail
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound
    }
  ]
})

export default router
