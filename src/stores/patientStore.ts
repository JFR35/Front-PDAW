// src/stores/patientStore.ts
import { defineStore } from 'pinia'
import api from '@/services/apiService'
import type { Patient } from '@/types/patientTyped'

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
    },

    async createPatient(patientData: Omit<Patient, 'id'>) {
      this.loading = true
      try {
        const response = await api.post<Patient>('/patients', patientData)
        this.patients.push(response.data)
        return response.data
      } catch (error) {
        this.error = 'Error al crear el paciente'
        console.error('Error creating patient:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updatePatient(patientData: Patient) {
      this.loading = true
      try {
        const response = await api.put<Patient>(`/patients/${patientData.id}`, patientData)
        const index = this.patients.findIndex(p => p.id === patientData.id)
        if (index !== -1) {
          this.patients[index] = response.data
        }
        return response.data
      } catch (error) {
        this.error = 'Error al actualizar el paciente'
        console.error('Error updating patient:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deletePatient(id: number) {
      this.loading = true
      try {
        await api.delete(`/patients/${id}`)
        this.patients = this.patients.filter(patient => patient.id !== id)
      } catch (error) {
        this.error = `Error al eliminar el paciente con ID: ${id}`
        console.error(`Error deleting patient with ${id}:`, error)
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
