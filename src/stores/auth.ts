import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/apiService'
import type { AuthResponse } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false)
  const username = ref('')
  const token = ref('')

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
        localStorage.setItem('jwtToken', authData.token)
        isLoggedIn.value = true
        username.value = email
        console.log('Token guardado en localStorage:', localStorage.getItem('jwtToken'))
        return true
      } else {
        console.error('Error: No se encontró el token en la respuesta:', authData)
        logout()
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      console.error('Error details:', error.response ? error.response.data : error.message)
      logout()
      return false
    }
  }

  const logout = () => {
    token.value = ''
    localStorage.removeItem('jwtToken')
    isLoggedIn.value = false
    username.value = ''
    console.log('Token eliminado de localStorage')
  }

  const initialize = () => {
    const storedToken = localStorage.getItem('jwtToken')
    if (storedToken) {
      token.value = storedToken
      isLoggedIn.value = true
      console.log('Token inicializado desde localStorage:', storedToken)
    } else {
      console.log('No se encontró token en localStorage al inicializar')
    }
  }

  initialize()

  return { isLoggedIn, username, token, login, logout }
})
