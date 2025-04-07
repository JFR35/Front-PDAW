import { defineStore } from 'pinia'
import api from '@/services/apiService'

interface Patient {
  id: number
  name: string
  age: number
  // Añade más campos según tu API
}

export const usePatientStore = defineStore('patients', {
  state: () => ({
    patients: [] as Patient[],
    currentPatient: null as Patient | null,
  }),
  actions: {
    async fetchPatients() {
      try {
        const response = await api.get('/patients')
        this.patients = response.data
      } catch (error) {
        console.error('Error fetching patients:', error)
      }
    },
    async fetchPatient(id: number) {
      try {
        const response = await api.get(`/patients/${id}`)
        this.currentPatient = response.data
      } catch (error) {
        console.error('Error fetching patient:', error)
      }
    },
  },
})
