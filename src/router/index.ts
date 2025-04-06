import { createRouter, createWebHistory } from 'vue-router'
import AuthLayout from '../layouts/AuthLayout.vue'
import GuestLayout from '@/layouts/GuestLayout.vue'
import LoginView from '@/pages/LoginView.vue'
import DashboardView from '@/pages/DashboardView.vue'
import { useAuthStore } from '@/stores/auth'
const routes = [
  {
    path: '/login',
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
    path: '/',
    component: AuthLayout,
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: DashboardView,
        meta: { requiresAuth: true }, // False para pruebas True con auth
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next('/login')
  } else if (to.name === 'login' && auth.isLoggedIn) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
