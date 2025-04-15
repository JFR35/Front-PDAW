/**
 * Maneja la autenticación del usuariocon acciones Login/logoute + validación de Roles
 * Se almacena en localStorage para recordar datos importantes
 * como el token y rol del usuario
*/
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/apiService'
import type { AuthResponse } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false)
  const username = ref('')
  const token = ref('')
  const userRole = ref('')

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      console.log('Full response:', response)
      console.log('Response data:', response.data)

      const authData: AuthResponse = response.data
      console.log('Auth data:', authData)

      if (authData && authData.token) {
        console.log('Token recibido:', authData.token)
        token.value = authData.token
        userRole.value = authData.role || ''
        localStorage.setItem('jwtToken', authData.token)
        localStorage.setItem('userRole', userRole.value)
        isLoggedIn.value = true
        username.value = email
        return true
      } else {
        console.error('Error: No se encontró el token en la respuesta:', authData)
        logout()
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      logout()
      return false
    }
  }

  const logout = () => {
    token.value = ''
    userRole.value = ''
    localStorage.removeItem('jwtToken')
    localStorage.removeItem('userRole')
    isLoggedIn.value = false
    username.value = ''
  }

  const initialize = () => {
    const storedToken = localStorage.getItem('jwtToken')
    const storedRole = localStorage.getItem('userRole')
    if (storedToken) {
      token.value = storedToken
      userRole.value = storedRole || ''
      isLoggedIn.value = true
    }
  }

  const isAdmin = computed(() => userRole.value === 'ROLE_ADMIN')
  const isPractitioner = computed(() => userRole.value === 'ROLE_PRACTITIONER')

  initialize()

  return {
    isLoggedIn,
    username,
    token,
    userRole,
    isAdmin,
    isPractitioner,
    login,
    logout
  }
})
