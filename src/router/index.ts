/**
 * Define las rutas del sistema y la lógica de autenticación usando vue-router
 */
import { createRouter, createWebHistory } from 'vue-router'
import AuthLayout from '../layouts/AuthLayout.vue'
import GuestLayout from '@/layouts/GuestLayout.vue'
import LoginView from '@/pages/LoginView.vue'
import DashboardView from '@/pages/DashboardView.vue'
import { useAuthStore } from '@/stores/authStore'
import PatientsView from '@/pages/PatientsView.vue'
import AppoinmentView from '@/pages/AppoinmentView.vue'
import BloodPressureChartView from '@/pages/BloodPressureChartView.vue'
import ConfigView from '@/pages/AdminUsers.vue'
import FhirProfilePractitionerView from '@/pages/ProfilePractitionerView.vue'

//import ForgotPassword from '@/pages/ForgotPassword.vue'

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
      /*
      {
        path: '/ForgotPassword',
        name: 'ForgotPassword',
        component: ForgotPassword
      }
        */
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
        meta: { requiresAuth: true, roles: ['ROLE_PRACTITIONER'] },
      },
      {
        path: 'pacientes',
        name: 'pacientes',
        component: PatientsView,
        meta: { requiresAuth: true, roles: ['ROLE_PRACTITIONER']},
      },
      {
        path: 'practitioner',
        name: 'practitioner',
        component: FhirProfilePractitionerView,
        meta: { requiresAuth: true, roles: ['ROLE_PRACTITIONER'] },
      },
      {
        path: 'bloodPressureChart',
        name: 'bloodPressureChart',
        component: BloodPressureChartView,
        meta: { requiresAuth: true, roles: ['ROLE_PRACTITIONER'] },
      },
      {
        path: 'configuracion',
        name: 'configuracion',
        component: ConfigView,
        meta: { requiresAuth: true, roles: ['ROLE_ADMIN']}
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

  // Si la ruta requiere autenticación y el usuario no está logueado
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next('/')
    return
  }

  // Si el usuario está logueado pero intenta acceder al login
  if (to.name === 'login' && auth.isLoggedIn) {
    next('/dashboard')
    return
  }

  // Si la ruta requiere roles específicos
  if (to.meta.roles) {
    // Verifica si el usuario tiene el rol requerido
    const hasRequiredRole = to.meta.roles.some(requiredRole =>
      auth.userRole === requiredRole
    )

    if (!hasRequiredRole) {
      // Redirige según el rol del usuario
      if (auth.isAdmin) {
        next('/dashboard/configuracion')
      } else if (auth.isPractitioner) {
        next('/dashboard/citas')
      } else {
        next('/')
      }
      return
    }
  }

  // Si todo está bien, continúa
  next()
})

export default router
