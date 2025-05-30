/**
 * Se definen las operaciones CRUD para los usuarios, usando pinia para la
 * gestión del estado.
 * Usa las importaciones de la interfaz User de userType.ts para el tipado.
 * Usa apiService para comunicar con el backend
 */
import { defineStore } from 'pinia';
import api from '@/services/apiService';
import { AxiosError } from 'axios';
import type { User } from '@/types/userType';

// Array de users para almacenar usuarios
interface UserState {
  users: User[];
  loading: boolean; // Boolean para operaciones en curso
  error: string | undefined; // Para manejar errores
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    users: [],
    loading: false,
    error: undefined,
  }),

  actions: {
    async createUser(userData: Omit<User, 'userId'>) {
      this.loading = true;
      try {
        const response = await api.post('/users', userData);
        this.users.push(response.data);
        this.error = undefined;
        return response.data;
      } catch (error: unknown) {
        this.error =
          (error instanceof AxiosError && error.response?.data?.message) ||
          (error instanceof Error && error.message) ||
          'Error creating user';
        throw new Error(this.error);
      } finally {
        this.loading = false;
      }
    },

    async loadMedicUsers() {
      this.loading = true;
      try {
        const response = await api.get('/users');
        this.users = response.data.filter((user: User) =>
          user.roles?.some(role =>
            role === 'ROLE_PRACTITIONER' ||
            (typeof role === 'object' && role.name === 'ROLE_PRACTITIONER')
          )
        );
        this.error = undefined;
      } catch (error: unknown) {
        this.error =
          (error instanceof AxiosError && error.response?.data?.message) ||
          (error instanceof Error && error.message) ||
          'Error loading medic users';
      } finally {
        this.loading = false;
      }
    },

    async updateUser(userData: User) {
      if(!userData.userId) {
        throw new Error('User ID is required for update');
      }
      this.loading = true;
      try {
        const response = await api.put(`/users/${userData.userId}`, userData);

        // Actualiza el usuario en el array local
        const index = this.users.findIndex(user => user.userId === userData.userId);
        if (index !== -1) {
          this.users[index] = response.data;
        }

        this.error = undefined;
        return response.data;
      } catch (error: unknown) {
        this.error =
          (error instanceof AxiosError && error.response?.data?.message) ||
          (error instanceof Error && error.message) ||
          'Error updating user';
        throw new Error(this.error);
      } finally {
        this.loading = false;
      }
    },

    async deleteUser(userId: number) {
      this.loading = true;
      try {
        await api.delete(`/users/${userId}`);

        // Elimina el usuario del array local
        this.users = this.users.filter(user => user.userId !== userId);

        this.error = undefined;
        return true;
      } catch (error: unknown) {
        this.error =
          (error instanceof AxiosError && error.response?.data?.message) ||
          (error instanceof Error && error.message) ||
          'Error deleting user';
        throw new Error(this.error);
      } finally {
        this.loading = false;
      }
    }
  },

  getters: {
    medicUsers: (state) =>
      state.users.filter(user =>
        user.roles?.some(role => {
          if (typeof role === 'string') return role === 'ROLE_PRACTITIONER';
          if (typeof role === 'object' && 'name' in role) return role.name === 'ROLE_PRACTITIONER';
          return false;
        })
      ),
  },
});
