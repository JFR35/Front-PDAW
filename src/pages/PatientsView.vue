<script setup lang="ts">
import { onMounted } from 'vue'
import { usePatientStore } from '@/stores/patientStore'
import { ref } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import type { Patient } from '@/types/patientTyped'

const patientStore = usePatientStore()

// Estados para los modales
const showDeleteModal = ref(false)
const showViewModal = ref(false)
const showEditModal = ref(false)
const showCreateModal = ref(false)

const emptyPatient: Patient = { id: 0, name: '', age: 0 }
const selectedPatient = ref<Patient>({ ...emptyPatient })

// Funciones para abrir modales
const openDeleteModal = (patient: Patient) => {
  selectedPatient.value = patient
  showDeleteModal.value = true
}

const openViewModal = (patient: Patient) => {
  selectedPatient.value = patient
  showViewModal.value = true
}

const openEditModal = (patient: Patient) => {
  selectedPatient.value = patient
  showEditModal.value = true
}

const openCreateModal = () => {
  selectedPatient.value = { ...emptyPatient }
  showCreateModal.value = true
}

// Funciones para cerrar modales
const closeModal = () => {
  showDeleteModal.value = false
  showViewModal.value = false
  showEditModal.value = false
  showCreateModal.value = false
  selectedPatient.value = null
}

const savePatient = async () => {
  if (!selectedPatient.value) return

  try {
    if (selectedPatient.value.id === 0) {
      // Crear nuevo paciente
      const { id, ...patientData } = selectedPatient.value
      await patientStore.createPatient(patientData)
    } else {
      // Actualizar paciente existente
      await patientStore.updatePatient(selectedPatient.value)
    }

    closeModal()
    await patientStore.fetchPatients() // Refrescar la lista
  } catch (error) {
    console.error('Error saving patient:', error)
  }
}
// Función para eliminar paciente
const deletePatient = async() => {
  if(selectedPatient.value) {
    await patientStore.deletePatient(selectedPatient.value.id)
    closeModal()
  }
}

onMounted(async () => {
  await patientStore.fetchPatients()
})
</script>

<template>
  <div class="container py-4">
    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/dashboard" class="text-decoration-none">
            <i class="fas fa-home"></i> Dashboard
          </router-link>
        </li>
        <li class="breadcrumb-item active" aria-current="page">Pacientes</li>
      </ol>
    </nav>

    <!-- Header con título y botón -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">
          <i class="fas fa-users text-primary me-2"></i>Panel del paciente
        </h2>
        <p class="text-muted mb-0">Registrar observaciones</p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary">
        <i class="fas fa-user-plus"></i> Nuevo Paciente
      </button>
    </div>

    <!-- Tabla de pacientes -->
    <div class="card shadow-sm">
      <div class="card-body p-0">
        <div v-if="patientStore.patients.length > 0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th class="text-nowrap">ID</th>
                  <th class="text-nowrap">Nombre</th>
                  <th class="text-nowrap">Edad</th>
                  <th class="text-nowrap text-end">Acciones</th>
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
                        @click="openViewModal(patient)"
                        class="btn btn-sm btn-outline-primary"
                        title="Ver detalles"
                      >
                        <i class="fas fa-eye"></i>
                      </button>
                      <button
                        @click="openEditModal(patient)"
                        class="btn btn-sm btn-outline-secondary"
                        title="Editar"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        @click="openDeleteModal(patient)"
                        class="btn btn-sm btn-outline-danger"
                        title="Eliminar"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else class="text-center p-5">
          <i class="fas fa-users display-5 text-muted mb-3"></i>
          <h5 class="text-muted">No hay pacientes registrados</h5>
          <p class="text-muted">Comienza agregando un nuevo paciente</p>
          <button @click="openCreateModal" class="btn btn-primary mt-3">
            <i class="fas fa-user-plus"></i> Agregar Paciente
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para eliminar paciente -->
    <BaseModal :visible="showDeleteModal" @close="closeModal">
      <div class="text-center">
        <i class="fas fa-exclamation-triangle text-warning display-5 mb-3"></i>
        <h4>¿Eliminar paciente?</h4>
        <p>¿Estás seguro que deseas eliminar a {{ selectedPatient?.name }}? Esta acción no se puede deshacer.</p>

        <div class="d-flex justify-content-center gap-3 mt-4">
          <button @click="closeModal" class="btn btn-outline-secondary">
            Cancelar
          </button>
          <button @click="deletePatient" class="btn btn-danger">
            <i class="fas fa-trash"></i> Eliminar
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- Modal para ver paciente -->
    <BaseModal :visible="showViewModal" @close="closeModal" size="lg">
      <div v-if="selectedPatient">
        <h3 class="text-center mb-4">Detalles del Paciente</h3>
        <div class="row">
          <div class="col-md-6">
            <p><strong>ID:</strong> {{ selectedPatient.id }}</p>
            <p><strong>Nombre:</strong> {{ selectedPatient.name }}</p>
            <p><strong>Edad:</strong> {{ selectedPatient.age }} años</p>
          </div>
          <div class="col-md-6">
            <!-- Aquí puedes agregar más detalles si los tienes -->
          </div>
        </div>
        <div class="text-center mt-4">
          <button @click="closeModal" class="btn btn-primary">
            Cerrar
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- Modal para editar paciente -->
    <BaseModal :visible="showEditModal" @close="closeModal" size="lg">
      <div v-if="selectedPatient">
        <h3 class="text-center mb-4">Editar Paciente</h3>
        <form @submit.prevent="savePatient">
          <div class="mb-3">
            <label for="editName" class="form-label">Nombre</label>
            <input
              type="text"
              class="form-control"
              id="editName"
              v-model="selectedPatient.name"
              required
            >
          </div>
          <div class="mb-3">
            <label for="editAge" class="form-label">Edad</label>
            <input
              type="number"
              class="form-control"
              id="editAge"
              v-model="selectedPatient.age"
              required
            >
          </div>
          <div class="d-flex justify-content-center gap-3 mt-4">
            <button @click="closeModal" class="btn btn-outline-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save"></i> Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </BaseModal>

    <!-- Modal para crear paciente -->
    <BaseModal :visible="showCreateModal" @close="closeModal" size="lg">
      <div>
        <h3 class="text-center mb-4">Nuevo Paciente</h3>
        <form @submit.prevent="savePatient">
          <div class="mb-3">
            <label for="createName" class="form-label">Nombre</label>
            <input
              type="text"
              class="form-control"
              id="createName"
              v-model="selectedPatient.name"
              required
            >
          </div>
          <div class="mb-3">
            <label for="createAge" class="form-label">Edad</label>
            <input
              type="number"
              class="form-control"
              id="createAge"
              v-model="selectedPatient.age"
              required
            >
          </div>
          <div class="d-flex justify-content-center gap-3 mt-4">
            <button @click="closeModal" class="btn btn-outline-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save"></i> Guardar Paciente
            </button>
          </div>
        </form>
      </div>
    </BaseModal>
  </div>
</template>

<style scoped>
.table {
  margin-top: 20px;
}
.alert {
  margin-top: 20px;
}
</style>
