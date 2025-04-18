// src/stores/userStore.ts
import { defineStore } from 'pinia';
import api from '@/services/apiService';
import { AxiosError } from 'axios';
import type { User } from '@/types/userType';
interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    users: [],
    loading: false,
    error: null,
  }),

  actions: {
    async createUser(userData: Omit<User, 'userId'>) { // Omitir userId ya que se genera en el backend
      this.loading = true;
      try {
        const response = await api.post('/users', userData);
        this.users.push(response.data); // O recargar la lista completa
        this.error = null;
        return response.data;
      } catch (error: unknown) {
        this.error = (error instanceof AxiosError && error.response?.data?.message) || (error instanceof Error && error.message) || 'Error creating user';
        throw new Error(this.error);
      } finally {
        this.loading = false;
      }
    },

    async loadMedicUsers() {
      this.loading = true;
      try {
        const response = await api.get('/users'); // Ajusta la URL si necesitas filtrar por rol en el backend
        this.users = response.data.filter((user: User) =>
          user.roles?.some(role => role.name === 'ROLE_PRACTITIONER')
        );
        this.error = null;
      } catch (error: unknown) {
        this.error = (error instanceof AxiosError && error.response?.data?.message) || (error instanceof Error && error.message) || 'Error loading medic users';
      } finally {
        this.loading = false;
      }
    },

    // ... otras acciones para gestionar usuarios
  },

  getters: {
    medicUsers: (state) => state.users.filter(user =>
      user.roles?.some(role => role.name === 'ROLE_PRACTITIONER')
    ),
  },
});
