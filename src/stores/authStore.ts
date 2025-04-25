/**
 * Maneja la autenticación del usuario con acciones Login/Logout + validación de Roles.
 * Se almacena en localStorage para recordar datos importantes como el token, rol y userId del usuario.
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/apiService';
import type { AuthResponse } from '@/types/auth';

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false);
  const username = ref('');
  const token = ref('');
  const userRole = ref('');
  const userId = ref<string | null>(null); // Permitir null inicialmente
  const hasPractitionerProfile = ref(false); // Nuevo estado para el perfil del practicante

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const authData: AuthResponse = response.data;
      console.log('Auth data:', authData);

      if (authData && authData.token) {
        token.value = authData.token;
        userRole.value = authData.role || '';
        userId.value = authData.userId || ''; // Asegúrate de que el backend incluya userId

        localStorage.setItem('jwtToken', authData.token);
        localStorage.setItem('userRole', userRole.value);
        localStorage.setItem('userId', userId.value);

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
    hasPractitionerProfile.value = false;
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
      userId.value = storedUserId || null;
      isLoggedIn.value = true;
    }
  };

  // Computed para roles
  const isAdmin = computed(() => userRole.value === 'ROLE_ADMIN');
  const isPractitioner = computed(() => userRole.value === 'ROLE_PRACTITIONER');

  // Verifica si el practicante tiene un perfil creado
  const checkPractitionerProfile = async (): Promise<boolean> => {
    if (!userId.value || userId.value.trim() === '') {
      console.warn('userId es undefined o vacío, no se puede verificar el perfil del practicante.');
      return false;
    }
    try {
      const response = await api.get(`/practitioners/user/${userId.value}/profile`); // Ajusta la ruta de tu API
      hasPractitionerProfile.value = !!response.data && response.status === 200;
      return hasPractitionerProfile.value;
    } catch (error) {
      console.error('Error al verificar el perfil del practicante:', error);
      hasPractitionerProfile.value = false;
      return false;
    }
  };

  initialize();

  return {
    isLoggedIn,
    username,
    token,
    userRole,
    userId,
    isAdmin,
    isPractitioner,
    hasPractitionerProfile,
    login,
    logout,
    checkPractitionerProfile,
  };
});
