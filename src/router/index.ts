import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/pages/LoginPage.vue'
import DashboardPage from '@/pages/DashboardPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: LoginPage,
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: DashboardPage,
    },
    {
      path: '/', // Redirigela ruta raíz al Login o dashboard si estás autenticado
      redirect: '/login',
    },
  ],
})

export default router
