<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { usePatientStore } from '@/stores/patientStore'
import type { Patient } from '@/types/patientTyped'

const patientStore = usePatientStore()
const activeTab = ref('list')
const selectedPatient = ref<Patient | null>(null)
const isSubmitting = ref(false)
const formError = ref('')

const emptyPatient: Patient = { id: 0, name: '', age: 0, /* otros campos */ }

// Cargar pacientes
onMounted(async () => {
  try {
    await patientStore.fetchPatients()
  } catch (error) {
    console.error('Error loading patients:', error)
  }
})

// Funciones de navegación
const showList = () => {
  activeTab.value = 'list'
  selectedPatient.value = null
}

const showCreateForm = () => {
  activeTab.value = 'form'
  selectedPatient.value = { ...emptyPatient }
}

const showEditForm = (patient: Patient) => {
  activeTab.value = 'form'
  selectedPatient.value = { ...patient }
}

const showDetails = (patient: Patient) => {
  activeTab.value = 'details'
  selectedPatient.value = { ...patient }
}

// Guardar paciente
const savePatient = async () => {
  if (!selectedPatient.value) return

  isSubmitting.value = true
  formError.value = ''

  try {
    if (selectedPatient.value.id === 0) {
      await patientStore.createPatient(selectedPatient.value)
    } else {
      await patientStore.updatePatient(selectedPatient.value)
    }
    showList()
    await patientStore.fetchPatients()
  } catch (error) {
    formError.value = 'Error al guardar el paciente. Por favor intente nuevamente.'
    console.error('Error saving patient:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Eliminar paciente
const deletePatient = async () => {
  if (!selectedPatient.value) return

  isSubmitting.value = true
  formError.value = ''

  try {
    await patientStore.deletePatient(selectedPatient.value.id)
    showList()
    await patientStore.fetchPatients()
  } catch (error) {
    formError.value = 'Error al eliminar el paciente. Por favor intente nuevamente.'
    console.error('Error deleting patient:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="container py-4">
    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/dashboard" class="text-decoration-none">
            <i class=""></i> Dashboard
          </router-link>
        </li>
        <li class="breadcrumb-item active" aria-current="page">Pacientes</li>
      </ol>
    </nav>

    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">
          <i class=""></i>Gestión de Pacientes
        </h2>
        <p class="text-muted mb-0">Administra los registros médicos</p>
      </div>
      <button
        v-if="activeTab === 'list'"
        @click="showCreateForm"
        class="btn btn-primary"
      >
        <i class="fas fa-check-circle text-success"></i> Nuevo Paciente
      </button>
      <button
        v-else
        @click="showList"
        class="btn btn-outline-secondary"
      >
        <i class="fas fa-arrow-left me-2"></i> Volver
      </button>
    </div>

    <!-- Lista de pacientes -->
    <div v-if="activeTab === 'list'" class="card shadow-sm">
      <div class="card-body p-0">
        <div v-if="patientStore.patients.length > 0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Edad</th>
                  <th class="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="patient in patientStore.patients" :key="patient.id">
                  <td class="fw-semibold">#{{ patient.id }}</td>
                  <td>{{ patient.name }}</td>
                  <td>{{ patient.age }} años</td>
                  <td class="text-end">
                    <div class="d-flex gap-2 justify-content-end">
                      <button
                        @click="showDetails(patient)"
                        class="btn btn-sm btn-outline-primary"
                        title="Ver detalles"
                      >
                        <i class="fas fa-eye"></i>
                      </button>
                      <button
                        @click="showEditForm(patient)"
                        class="btn btn-sm btn-outline-warning"
                        title="Editar"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        @click="deletePatient(patient)"
                        class="btn btn-sm btn-outline-danger"
                        title="Eliminar"
                      >
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else class="text-center p-5">
          <i class=""></i>
          <h5 class="text-muted">No hay pacientes registrados</h5>
          <button @click="showCreateForm" class="btn btn-primary mt-3">
            <i class="fas fa-check-circle text-success"></i> Agregar Paciente
          </button>
        </div>
      </div>
    </div>

    <!-- Formulario de paciente -->
    <div v-else-if="activeTab === 'form'" class="card shadow-sm">
      <div class="card-body">
        <h3 class="card-title mb-4">
          <i class="fas fa-user-edit me-2"></i>
          {{ selectedPatient?.id ? 'Editar' : 'Nuevo' }} Paciente
        </h3>

        <div v-if="formError" class="alert alert-danger">
          {{ formError }}
        </div>

        <form @submit.prevent="savePatient">
          <div class="row g-3">
            <div class="col-md-6">
              <label for="name" class="form-label">Nombre completo</label>
              <input
                type="text"
                class="form-control"
                id="name"
                v-model="selectedPatient.name"
                required
                placeholder="Ej: Juan Pérez"
              >
            </div>

            <div class="col-md-6">
              <label for="age" class="form-label">Edad</label>
              <input
                type="number"
                class="form-control"
                id="age"
                v-model="selectedPatient.age"
                required
                min="0"
                max="120"
                placeholder="Ej: 35"
              >
            </div>

            <!-- Agrega más campos según necesites -->

            <div class="col-12 mt-4">
              <div class="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  @click="showList"
                  class="btn btn-outline-secondary"
                  :disabled="isSubmitting"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="isSubmitting"
                >
                  <span v-if="isSubmitting">
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Guardando...
                  </span>
                  <span v-else>
                    <i class="fas fa-save me-2"></i>
                    {{ selectedPatient?.id ? 'Actualizar' : 'Guardar' }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Detalles del paciente -->
    <div v-else-if="activeTab === 'details' && selectedPatient" class="card shadow-sm">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start mb-4">
          <h3 class="card-title mb-0">
            <i class="fas fa-user-circle me-2"></i>
            Detalles del Paciente
          </h3>
          <button @click="showList" class="btn btn-sm btn-outline-secondary">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="patient-detail mb-3">
              <h6 class="text-muted mb-1">ID</h6>
              <p class="fs-5">#{{ selectedPatient.id }}</p>
            </div>

            <div class="patient-detail mb-3">
              <h6 class="text-muted mb-1">Nombre completo</h6>
              <p class="fs-5">{{ selectedPatient.name }}</p>
            </div>

            <div class="patient-detail mb-3">
              <h6 class="text-muted mb-1">Edad</h6>
              <p class="fs-5">{{ selectedPatient.age }} años</p>
            </div>
          </div>

          <div class="col-md-6">
            <!-- Aquí puedes agregar más detalles -->
          </div>
        </div>

        <div class="mt-4 pt-3 border-top">
          <button
            @click="showEditForm(selectedPatient)"
            class="btn btn-warning me-2"
          >
            <i class="fas fa-edit me-2"></i> Editar
          </button>
          <button
            @click="deletePatient"
            class="btn btn-outline-danger"
          >
            <i class="fas fa-trash-alt me-2"></i> Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.patient-detail {
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
}

.table th {
  font-weight: 600;
}

.card-title {
  font-weight: 600;
}
</style>
