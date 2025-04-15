<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { usePatientStore } from '@/stores/patientStore';
import type { Patient } from '@/types/patientTyped';
import { emptyPatient } from '@/types/patientTyped';

const patientStore = usePatientStore();
const activeTab = ref('list');
const selectedPatient = ref<Patient>(structuredClone(emptyPatient));
const isSubmitting = ref(false);
const formError = ref('');

// Cargar pacientes al montar el componente
onMounted(async () => {
  await patientStore.fetchPatients();
});

// Funciones de navegación
const showList = () => (activeTab.value = 'list');
const showCreateForm = () => {
  activeTab.value = 'form';
  selectedPatient.value = structuredClone(emptyPatient);
};
const showEditForm = (patient: Patient) => {
  activeTab.value = 'form';
  selectedPatient.value = structuredClone(patient);
};
const showDetails = (patient: Patient) => {
  activeTab.value = 'details';
  selectedPatient.value = structuredClone(patient);
};

// Guardar paciente
const savePatient = async () => {
  if (!selectedPatient.value) return;

  isSubmitting.value = true;
  formError.value = '';

  try {
    if (!selectedPatient.value.id) {
      await patientStore.createPatient(selectedPatient.value);
    } else {
      await patientStore.updatePatient(selectedPatient.value);
    }
    showList();
    await patientStore.fetchPatients();
  } catch (error: AxiosError<{ message?: string }>) {
    // Access Axios-specific properties
    formError.value =
      error.response?.data?.message ||
      error.message ||
      'Error al guardar el paciente. Por favor intente nuevamente.';
    console.error('Error saving patient:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// Eliminar paciente
const deletePatient = async (patientToDelete: Patient) => {
  if (!patientToDelete?.id) return;

  isSubmitting.value = true;
  formError.value = '';

  try {
    await patientStore.deletePatient(patientToDelete.id);
    showList();
    await patientStore.fetchPatients();
  } catch (error: AxiosError<{ message?: string }>) {
    // Access Axios-specific properties
    formError.value =
      error.response?.data?.message ||
      error.message ||
      'Error al eliminar el paciente. Por favor intente nuevamente.';
    console.error('Error deleting patient:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// Calcula la edad a partir de la fecha de nacimiento
const calculateAge = (birthDate: string): number => {
  if (!birthDate) return 0;
  const today = new Date();
  const birthDateObj = new Date(birthDate);
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  return age;
};

// Nombre completo computado para la vista de detalles
const fullName = computed(() => {
  if (selectedPatient.value?.name?.[0]) {
    return `${selectedPatient.value.name[0].given.join(' ')} ${selectedPatient.value.name[0].family || ''}`;
  }
  return '';
});

// Edad actual computada para el formulario
const currentAge = computed(() => {
  return selectedPatient.value?.birthDate ? calculateAge(selectedPatient.value.birthDate) : '';
});
</script>
<template>
  <div class="container py-4">
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

    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">
          <i class="fas fa-user-injured me-2"></i> Gestión de Pacientes
        </h2>
        <p class="text-muted mb-0">Administra los registros médicos FHIR</p>
      </div>
      <button v-if="activeTab === 'list'" @click="showCreateForm" class="btn btn-primary">
        <i class="fas fa-plus-circle me-2"></i> Nuevo Paciente
      </button>
      <button v-else @click="showList" class="btn btn-outline-secondary">
        <i class="fas fa-arrow-left me-2"></i> Volver
      </button>
    </div>

    <div v-if="formError" class="alert alert-danger mb-4">
      <i class="fas fa-exclamation-circle me-2"></i> {{ formError }}
    </div>

    <div v-if="activeTab === 'list'" class="card shadow-sm">
      <div class="card-body p-0">
        <div v-if="patientStore.loading" class="text-center p-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-3">Cargando pacientes...</p>
        </div>
        <div v-else-if="patientStore.patients.length > 0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Género</th>
                  <th>Fecha de Nacimiento</th>
                  <th class="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="patient in patientStore.patients" :key="patient.id">
                  <td class="fw-semibold">{{ patient.identifier?.length ? patient.identifier[0].value : 'N/A' }}</td>
                  <td>{{ patient.name?.[0]?.given?.join(' ') || 'Sin Nombre' }} {{ patient.name?.[0]?.family || '' }}</td>
                  <td>
                    <span
                      class="badge"
                      :class="{
                        'bg-primary': patient.gender === 'male',
                        'bg-danger': patient.gender === 'female',
                        'bg-secondary': patient.gender === 'unknown',
                        'bg-warning': patient.gender === 'other',
                      }"
                    >
                      {{
                        patient.gender === 'male'
                          ? 'M'
                          : patient.gender === 'female'
                          ? 'F'
                          : patient.gender === 'other'
                          ? 'O'
                          : '?'
                      }}
                    </span>
                  </td>
                  <td>{{ patient.birthDate }}</td>
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
          <i class="fas fa-user-slash text-muted mb-3" style="font-size: 2.5rem"></i>
          <h5 class="text-muted">No hay pacientes registrados</h5>
          <button @click="showCreateForm" class="btn btn-primary mt-3">
            <i class="fas fa-plus-circle me-2"></i> Agregar Paciente
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'form'" class="card shadow-sm">
      <div class="card-body">
        <h3 class="card-title mb-4">
          <i class="fas fa-user-edit me-2"></i>
          {{ selectedPatient.id ? 'Editar' : 'Nuevo' }} Paciente
        </h3>

        <div v-if="formError" class="alert alert-danger">
          <i class="fas fa-exclamation-circle me-2"></i> {{ formError }}
        </div>

        <form @submit.prevent="savePatient">
          <div class="row g-3">
            <div class="col-md-6">
              <label for="identifierSystem" class="form-label">Sistema de Identificación</label>
              <input
                type="text"
                class="form-control"
                id="identifierSystem"
                v-model="selectedPatient.identifier[0].system"
                required
                placeholder="Ej: http://hospital.org/patient-id"
              />
            </div>
            <div class="col-md-6">
              <label for="identifierValue" class="form-label">Número de Identificación</label>
              <input
                type="text"
                class="form-control"
                id="identifierValue"
                v-model="selectedPatient.identifier[0].value"
                required
                placeholder="Ej: 123456"
              />
            </div>

            <div class="col-md-6">
              <label for="givenName" class="form-label">Nombre(s)</label>
              <input
                type="text"
                class="form-control"
                id="givenName"
                v-model="selectedPatient.name[0].given[0]"
                required
                placeholder="Ej: Juan"
              />
            </div>
            <div class="col-md-6">
              <label for="familyName" class="form-label">Apellido</label>
              <input
                type="text"
                class="form-control"
                id="familyName"
                v-model="selectedPatient.name[0].family"
                placeholder="Ej: Pérez"
              />
            </div>

            <div class="col-md-6">
              <label for="gender" class="form-label">Género</label>
              <select class="form-select" id="gender" v-model="selectedPatient.gender" required>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
                <option value="unknown">Desconocido</option>
              </select>
            </div>

            <div class="col-md-6">
              <label for="birthDate" class="form-label">Fecha de Nacimiento</label>
              <div class="input-group">
                <input
                  type="date"
                  class="form-control"
                  id="birthDate"
                  v-model="selectedPatient.birthDate"
                  required
                />
                <span class="input-group-text"> Edad: {{ currentAge }} años </span>
              </div>
            </div>

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
                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                  <span v-if="isSubmitting">
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Guardando...
                  </span>
                  <span v-else>
                    <i class="fas fa-save me-2"></i>
                    {{ selectedPatient.id ? 'Actualizar' : 'Guardar' }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

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
              <h6 class="text-muted mb-1">Identificador</h6>
              <p class="fs-5">
                <span class="badge bg-light text-dark me-2">{{
                  selectedPatient.identifier[0]?.system || 'N/A'
                }}</span>
                {{ selectedPatient.identifier[0]?.value || 'N/A' }}
              </p>
            </div>

            <div class="patient-detail mb-3">
              <h6 class="text-muted mb-1">Nombre completo</h6>
              <p class="fs-5">{{ fullName }}</p>
            </div>

            <div class="patient-detail mb-3">
              <h6 class="text-muted mb-1">Género</h6>
              <p class="fs-5">
                <span
                  class="badge"
                  :class="{
                    'bg-primary': selectedPatient.gender === 'male',
                    'bg-danger': selectedPatient.gender === 'female',
                    'bg-secondary': selectedPatient.gender === 'unknown',
                    'bg-warning': selectedPatient.gender === 'other',
                  }"
                >
                  {{
                    selectedPatient.gender === 'male'
                      ? 'Masculino'
                      : selectedPatient.gender === 'female'
                      ? 'Femenino'
                      : selectedPatient.gender === 'other'
                      ? 'Otro'
                      : 'Desconocido'
                  }}
                </span>
              </p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="patient-detail mb-3">
              <h6 class="text-muted mb-1">Fecha de Nacimiento</h6>
              <p class="fs-5">{{ selectedPatient.birthDate || 'N/A' }}</p>
            </div>

            <div class="patient-detail mb-3">
              <h6 class="text-muted mb-1">Edad</h6>
              <p class="fs-5">{{ currentAge }} años</p>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-4">
          <button @click="showEditForm(selectedPatient)" class="btn btn-outline-warning">
            <i class="fas fa-edit me-2"></i> Editar
          </button>
          <button @click="deletePatient(selectedPatient)" class="btn btn-outline-danger">
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
