import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000,
})

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Manejo de errores HTTP
      console.error('Error response:', error.response)
    } else if (error.request) {
      // La petición fue hecha pero no hubo respuesta
      console.error('Error request:', error.request)
    } else {
      // Error al configurar la petición
      console.error('Error message:', error.message)
    }
    return Promise.reject(error)
  }
)

export default api
