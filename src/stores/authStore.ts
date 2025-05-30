import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/apiService';
import type { AuthResponse, AuthRequest, CreatePractitioner, ApiResponse, User } from '@/types/auth';

// Definición del store de autenticación con Pinia
export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false);
  const username = ref('');
  const token = ref('');
  const userRole = ref('');
  const userId = ref<string | null>(null);

  // Método para iniciar sesión en el sistema
  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const authData: AuthResponse = response.data;
      console.log('Auth data:', authData);

      // Verificación de token y datos de usuario
      if (authData && authData.token) {
        token.value = authData.token;
        userRole.value = authData.role || '';
        userId.value = authData.userId || null;

        // Advertencia si no se proporciona userId
        if (!authData.userId) {
          console.warn('No userId provided in auth response. Some functionalities may be limited.');
        }

        // Guardar datos en localStorage, incluyendo el token JWT
        localStorage.setItem('jwtToken', authData.token);
        localStorage.setItem('userRole', userRole.value);
        localStorage.setItem('userId', userId.value || '');

        // Actualizar el estado de autenticación
        isLoggedIn.value = true;
        username.value = email;
        return true;
      } else {
        console.error('Error: No se encontró el token en la respuesta:', authData);
        logout(); // Si el login falla cerrar sesión
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      logout(); // Eliminar datos de sesión en caso de error
      return false;
    }
  };

  // Método para cerrar sesión en el sistema
  const logout = () => {
    token.value = '';
    userRole.value = '';
    userId.value = null;
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    isLoggedIn.value = false;
    username.value = '';
  };

  // Método para inicializar el estado del store en LocalStorage
  const initialize = () => {
    const storedToken = localStorage.getItem('jwtToken');
    const storedRole = localStorage.getItem('userRole');
    const storedUserId = localStorage.getItem('userId');

    // En caso de que haya un token almacenado se restaura la sesión
    if (storedToken) {
      token.value = storedToken;
      userRole.value = storedRole || '';
      userId.value = storedUserId || null;
      isLoggedIn.value = true;
      console.log('Initialized with userId:', userId.value);
    } else {
      console.log('No stored token found, user not logged in.');
    }
  };

  // ROles de usuario
  const isAdmin = computed(() => userRole.value === 'ROLE_ADMIN');
  const isPractitioner = computed(() => userRole.value === 'ROLE_PRACTITIONER');
  // LLamada a la función de inicialización al cargar el store
  initialize();

  // Retornar el estado y las acciones del store
  return {
    isLoggedIn,
    username,
    token,
    userRole,
    userId,
    isAdmin,
    isPractitioner,
    login,
    logout,
  };
});

