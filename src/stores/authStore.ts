import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/apiService';
// Importa TODAS las interfaces necesarias desde tu archivo central de tipos
import type { AuthResponse, AuthRequest, CreatePractitioner, ApiResponse, User } from '@/types/auth';

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false);
  const username = ref('');
  const token = ref('');
  const userRole = ref('');
  const userId = ref<string | null>(null); // Mantener como string | null

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const authData: AuthResponse = response.data;
      console.log('Auth data:', authData);

      if (authData && authData.token) {
        token.value = authData.token;
        userRole.value = authData.role || '';
        userId.value = authData.userId || null; // Asegúrate de que userId venga como string

        if (!authData.userId) {
          console.warn('No userId provided in auth response. Some functionalities may be limited.');
        }

        localStorage.setItem('jwtToken', authData.token);
        localStorage.setItem('userRole', userRole.value);
        localStorage.setItem('userId', userId.value || ''); // Guardar como string

        isLoggedIn.value = true;
        username.value = email;
        return true;
      } else {
        console.error('Error: No se encontró el token en la respuesta:', authData);
        logout();
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      logout();
      return false;
    }
  };

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

  const initialize = () => {
    const storedToken = localStorage.getItem('jwtToken');
    const storedRole = localStorage.getItem('userRole');
    const storedUserId = localStorage.getItem('userId');

    if (storedToken) {
      token.value = storedToken;
      userRole.value = storedRole || '';
      userId.value = storedUserId || null; // Cargar como string | null
      isLoggedIn.value = true;
      console.log('Initialized with userId:', userId.value);
    } else {
      console.log('No stored token found, user not logged in.');
    }
  };

  const isAdmin = computed(() => userRole.value === 'ROLE_ADMIN');
  const isPractitioner = computed(() => userRole.value === 'ROLE_PRACTITIONER');

  // Asegúrate de que esta función 'checkPractitionerProfile' ya no está si no la necesitas
  // en el authStore, y que la lógica de carga del perfil está en PractitionerProfile.vue
  // const checkPractitionerProfile = async (): Promise<boolean> => { /* ... */ };

  initialize();

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

// ¡IMPORTANTE! No debe haber NINGUNA definición de interfaz aquí abajo.
// Todas deben estar en src/types/auth.ts
