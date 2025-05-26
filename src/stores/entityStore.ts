// src/stores/entityStore.ts
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
    // Add API calls if needed, e.g.:
    // async loadPatients() {
    //   const response = await api.get<Patient[]>('/patients');
    //   this.patients = response.data;
    // }
    // async loadPractitioners() {
    //   const response = await api.get<Practitioner[]>('/practitioners');
    //   this.practitioners = response.data;
    // }
  },
});
