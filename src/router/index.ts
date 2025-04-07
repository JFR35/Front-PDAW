import { createRouter, createWebHistory } from 'vue-router'
import AuthLayout from '../layouts/AuthLayout.vue'
import GuestLayout from '@/layouts/GuestLayout.vue'
import LoginView from '@/pages/LoginView.vue'
import DashboardView from '@/pages/DashboardView.vue'
import { useAuthStore } from '@/stores/auth'
import PatientsView from '@/pages/PatientsView.vue'
import AppoinmentView from '@/pages/AppoinmentView.vue'

const routes = [
  {
    path: '/',
    component: GuestLayout,
    children: [
      {
        path: '',
        name: 'login',
        component: LoginView,
      },
    ],
  },
  {
    path: '/dashboard',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardView,
        meta: { requiresAuth: true },
      },
      {
        path: 'citas',
        name: 'citas',
        component: AppoinmentView,
        meta: { requiresAuth: true },
      },
      {
        path: 'pacientes',
        name: 'pacientes',
        component: PatientsView,
        meta: { requiresAuth: true },
      }
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next('/') // Redirige al login si no está autenticado
  } else if (to.name === 'login' && auth.isLoggedIn) {
    next('/dashboard') // Si ya está autenticado y va al login, redirige al dashboard
  } else {
    next()
  }
})

export default router
