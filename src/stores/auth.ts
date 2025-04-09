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
      const authData: AuthResponse = response.data

      // Almacena el token
      token.value = authData.token
      localStorage.setItem('jwtToken', authData.token)

      // Actualiza estado
      isLoggedIn.value = true
      username.value = email // O puedes obtener el nombre del usuario de la respuesta si está disponible

      return true
    } catch (error) {
      console.error('Login error:', error)
      logout()
      return false
    }
  }

  const logout = () => {
    // Limpia el token
    token.value = ''
    localStorage.removeItem('jwtToken')

    // Resetea estado
    isLoggedIn.value = false
    username.value = ''
  }

  const initialize = () => {
    // Intenta cargar el token al iniciar
    const storedToken = localStorage.getItem('jwtToken')
    if (storedToken) {
      token.value = storedToken
      isLoggedIn.value = true
      // Aquí podrías hacer una petición para obtener los datos del usuario
    }
  }

  // Inicializa al crear el store
  initialize()

  return { isLoggedIn, username, token, login, logout }
})
