
import { createRouter, createWebHistory } from 'vue-router'
import Index from '../pages/Index.vue'
import BenefitDetail from '../pages/BenefitDetail.vue'
import Login from '../pages/Login.vue'
import NotFound from '../pages/NotFound.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Index
    },
    {
      path: '/beneficio/:id',
      name: 'benefitDetail',
      component: BenefitDetail
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: NotFound
    }
  ]
})

export default router
