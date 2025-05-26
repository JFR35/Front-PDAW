import { defineStore } from 'pinia';
import api from '@/services/apiService'; // Tu servicio Axios
import type { BloodPressureMeasurement } from '@/types/BloodPressureMeasurement'; // Importa la interfaz que acabas de crear
import { AxiosError } from 'axios';

interface BloodPressureState {
  history: BloodPressureMeasurement[];
  loading: boolean;
  error: string | null;
}

export const useBloodPressureStore = defineStore('bloodPressureStore', {
  state: (): BloodPressureState => ({
    history: [],
    loading: false,
    error: null,
  }),

  actions: {
    /**
     * Carga el historial de presión sanguínea para un paciente dado su nationalId.
     * @param nationalId El DNI/NIE del paciente.
     */
    async loadBloodPressureHistory(nationalId: string) {
      this.loading = true;
      this.error = null;
      try {
        // Llama a tu endpoint de Spring Boot que devuelve el DTO aplanado
        const response = await api.get<BloodPressureMeasurement[]>(`/patients/${nationalId}/blood-pressure-history`);
        this.history = response.data;
        this.loading = false;
      } catch (error: unknown) {
        this.loading = false;
        const errorMessage = (error instanceof AxiosError && error.response?.data?.message) || (error instanceof Error && error.message) || 'Error al cargar el historial de presión sanguínea.';
        this.error = errorMessage;
        // Opcional: relanzar el error para que el componente lo maneje si es necesario
        throw new Error(errorMessage);
      }
    },

    // Puedes añadir otras acciones aquí si necesitas, por ejemplo,
    // async addBloodPressureMeasurement(nationalId: string, measurement: BloodPressureMeasurement) { ... }
  },

  // Opcional: Getters si necesitas derivar estado
  getters: {
    // Ejemplo: Obtener la última medición
    latestMeasurement: (state) => {
      if (state.history.length === 0) return null;
      // Asumiendo que el backend ya ordena por fecha descendente
      return state.history[0];
    },
    // Ejemplo: Obtener mediciones ordenadas por fecha (si no vienen ordenadas del backend)
    sortedHistory: (state) => {
      return [...state.history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }
});
