// Clase de prueba para el store de pacientes y profesionales de la salud
import { defineStore } from 'pinia';

interface Patient {
  id: number;
  nationalId: string;
}

interface Practitioner {
  id: number;
  name: string;
}

interface EntityState {
  patients: Patient[];
  practitioners: Practitioner[];
}

// Carga los pacientes y profesionales de la salud
export const useEntityStore = defineStore('entityStore', {
  state: (): EntityState => ({
    patients: [
      { id: 1, nationalId: '12345678D' },
    ],
    practitioners: [
      { id: 1, name: 'Dr. Juan Fajardo' },
    ],
  }),

  actions: {

  },
});
