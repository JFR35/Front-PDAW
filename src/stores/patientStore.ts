/**
 * Gestiona las operaciones y mantiene el estado sincronizado
 * con el servidor
 */
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
    error: null,
  }),
  getters: {
    getPatientById: (state) => (id: number) => {
      return state.patients.find((patient) => patient.id === id)
    },
    totalPatients: (state) => state.patients.length,
  },
  actions: {
    async fetchPatients() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/patients');
        this.patients = response.data.map((p) => {
          const parsedPatient = JSON.parse(p.resourcePatientJson); // Deserializa el JSON
          return {
            id: p.id,
            name: parsedPatient.name || [{ given: ['Sin Nombre'], family: '' }],
            gender: parsedPatient.gender || 'unknown',
            birthDate: parsedPatient.birthDate || 'No disponible',
            identifier: parsedPatient.identifier || [{ value: 'N/A', system: 'unknown' }],
            text: parsedPatient.text || { div: '', status: 'generated' },
            resourceType: parsedPatient.resourceType || 'Patient',
          };
        });
      } catch (error) {
        this.error = 'Error al cargar los pacientes';
        console.error('Error fetching patients:', error);
      } finally {
        this.loading = false;
      }
    },


    async createPatient(patientData: Omit<Patient, 'id'>) {
      this.loading = true;
      try {
        const fhirPatient: Patient = {
          ...patientData,
          resourceType: 'Patient',
          text: {
            status: 'generated',
            div: `<div xmlns="http://www.w3.org/1999/xhtml">
              <p>Nombre: ${patientData.name?.[0]?.given?.join(' ') || 'Sin Nombre'} ${patientData.name?.[0]?.family || ''}</p>
              <p>Identificador: ${patientData.identifier?.[0]?.value || 'N/A'}</p>
              <p>Género: ${patientData.gender || 'unknown'}</p>
              <p>Fecha de Nacimiento: ${patientData.birthDate || 'No disponible'}</p>
            </div>`,
          },
        };

        const response = await api.post<Patient>('/patients', fhirPatient);
        this.patients.push(response.data);
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al crear el paciente';
        console.error('Error creating patient:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updatePatient(patientData: Patient) {
      this.loading = true
      try {
        const response = await api.put<Patient>(`/patients/${patientData.id}`, patientData)
        const index = this.patients.findIndex((p) => p.id === patientData.id)
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
        this.patients = this.patients.filter((patient) => patient.id !== id)
      } catch (error) {
        this.error = `Error al eliminar el paciente con ID: ${id}`
        console.error(`Error deleting patient with ${id}:`, error)
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
