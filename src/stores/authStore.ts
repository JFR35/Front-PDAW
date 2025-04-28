import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/apiService';
import type { AuthResponse } from '@/types/auth';

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false);
  const username = ref('');
  const token = ref('');
  const userRole = ref('');
  const userId = ref<string | null>(null);
  const hasPractitionerProfile = ref(false);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const authData: AuthResponse = response.data;
      console.log('Auth data:', authData);

      if (authData && authData.token) {
        token.value = authData.token;
        userRole.value = authData.role || '';
        userId.value = authData.userId || null;

        if (!authData.userId) {
          console.warn('No userId provided in auth response. Practitioner profile check may fail.');
        }

        localStorage.setItem('jwtToken', authData.token);
        localStorage.setItem('userRole', userRole.value);
        localStorage.setItem('userId', userId.value || '');

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
      console.log('Initialized with userId:', userId.value);
    } else {
      console.log('No stored token found, user not logged in.');
    }
  };

  const isAdmin = computed(() => userRole.value === 'ROLE_ADMIN');
  const isPractitioner = computed(() => userRole.value === 'ROLE_PRACTITIONER');

  const checkPractitionerProfile = async (): Promise<boolean> => {
    if (!isPractitioner.value) {
        console.log('User is not a practitioner, skipping profile check.');
        return false;
    }
    if (!userId.value) {
        console.warn('userId es null o undefined, no se puede verificar el perfil del practicante.');
        hasPractitionerProfile.value = false;
        return false;
    }
    try {
        console.log(`Verificando perfil para userId: ${userId.value}`);
        const response = await api.get(`/practitioners/user/${userId.value}/profile`);
        console.log('Respuesta del perfil:', response);
        hasPractitionerProfile.value = !!response.data && response.status === 200;
        console.log(`hasPractitionerProfile: ${hasPractitionerProfile.value}`);
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
