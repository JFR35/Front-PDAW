// src/stores/patientStore.ts
import { defineStore } from 'pinia'
import api from '@/services/apiService'
import type { Patient } from '@/types/patientStore'

interface PatientState {
  patients: Patient[]
  currentPatient: Patient | null
  loading: boolean
  error: string | null
}

export const usePatientStore = defineStore('patients', {
  state: (): PatientState => ({
    patients: [],
    currentPatient: null,
    loading: false,
    error: null
  }),
  getters: {
    getPatientById: (state) => (id: number) => {
      return state.patients.find(patient => patient.id === id)
    },
    totalPatients: (state) => state.patients.length
  },
  actions: {
    async fetchPatients() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get<Patient[]>('/patients')
        this.patients = response.data
      } catch (error) {
        this.error = 'Error al cargar los pacientes'
        console.error('Error fetching patients:', error)
      } finally {
        this.loading = false
      }
    },
    async fetchPatient(id: number) {
      this.loading = true
      try {
        const response = await api.get<Patient>(`/patients/${id}`)
        this.currentPatient = response.data
      } catch (error) {
        this.error = `Error al cargar el paciente con ID ${id}`
        console.error(`Error fetching patient ${id}:`, error)
      } finally {
        this.loading = false
      }
    }
  }
})
