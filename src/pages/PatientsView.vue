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
  <div class="patient-container">
    <!-- Breadcrumb -->
    <div class="container-fluid py-3 bg-light border-bottom">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb mb-0">
          <li class="breadcrumb-item">
            <router-link to="/dashboard" class="text-decoration-none text-primary">
              <i class="bi bi-house-door-fill me-1"></i> Dashboard
            </router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            <i class="bi bi-people-fill me-1"></i>Gestión de Pacientes
          </li>
        </ol>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="mb-1 fw-semibold">
            <i class="bi bi-person-vcard-fill me-2 text-primary"></i> Pacientes
          </h2>
          <p class="text-muted mb-0">Administra los registros médicos de pacientes</p>
        </div>
        <button
          v-if="activeTab === 'list'"
          @click="showCreateForm"
          class="btn btn-primary"
        >
          <i class="bi bi-plus-circle me-2"></i> Nuevo Paciente
        </button>
        <button
          v-else
          @click="showList"
          class="btn btn-outline-secondary"
        >
          <i class="bi bi-arrow-left me-2"></i> Volver
        </button>
      </div>

      <!-- Alert Messages -->
      <div v-if="formError" class="alert alert-danger alert-dismissible fade show mb-4" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        {{ formError }}
        <button type="button" class="btn-close" @click="formError = ''"></button>
      </div>

      <!-- List View -->
      <div v-if="activeTab === 'list'">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
            <h4 class="mb-0 fw-semibold">
              <i class="bi bi-list-ul me-2 text-primary"></i>
              Lista de Pacientes
            </h4>
            <span class="badge bg-primary rounded-pill">
              {{ patientStore.patients.length }}
            </span>
          </div>

          <div class="card-body p-0">
            <!-- Loading State -->
            <div v-if="patientStore.loading" class="d-flex justify-content-center align-items-center py-5">
              <div class="text-center">
                <div class="spinner-border text-primary mb-3" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="text-muted">Cargando pacientes...</p>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="patientStore.patients.length === 0" class="d-flex flex-column justify-content-center align-items-center py-5 text-center">
              <i class="bi bi-person-x text-muted" style="font-size: 3rem;"></i>
              <h5 class="mt-3 text-muted">No hay pacientes registrados</h5>
              <button @click="showCreateForm" class="btn btn-primary mt-3">
                <i class="bi bi-plus-circle me-2"></i> Agregar Paciente
              </button>
            </div>

            <!-- Data Table -->
            <div v-else class="table-container">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light sticky-top">
                  <tr>
                    <th class="ps-4">ID</th>
                    <th>Nombre</th>
                    <th>Género</th>
                    <th>Fecha Nacimiento</th>
                    <th class="text-end pe-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="patient in patientStore.patients" :key="patient.id" class="patient-row">
                    <td class="ps-4 fw-medium">{{ patient.identifier?.length ? patient.identifier[0].value : 'N/A' }}</td>
                    <td>
                      {{ patient.name?.[0]?.given?.join(' ') || 'Sin Nombre' }}
                      {{ patient.name?.[0]?.family || '' }}
                    </td>
                    <td>
                      <span class="badge" :class="{
                        'bg-primary': patient.gender === 'male',
                        'bg-danger': patient.gender === 'female',
                        'bg-secondary': patient.gender === 'unknown',
                        'bg-warning text-dark': patient.gender === 'other',
                      }">
                        {{
                          patient.gender === 'male' ? 'M' :
                          patient.gender === 'female' ? 'F' :
                          patient.gender === 'other' ? 'O' : '?'
                        }}
                      </span>
                    </td>
                    <td>{{ patient.birthDate }}</td>
                    <td class="text-end pe-4">
                      <div class="btn-group btn-group-sm" role="group">
                        <button
                          @click="showDetails(patient)"
                          class="btn btn-outline-primary"
                          title="Ver detalles"
                        >
                          <i class="bi bi-eye-fill"></i>
                        </button>
                        <button
                          @click="showEditForm(patient)"
                          class="btn btn-outline-warning"
                          title="Editar"
                        >
                          <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button
                          @click="deletePatient(patient)"
                          class="btn btn-outline-danger"
                          title="Eliminar"
                        >
                          <i class="bi bi-trash-fill"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Form View -->
      <div v-else-if="activeTab === 'form'" class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0 py-3">
              <h4 class="mb-0 fw-semibold">
                <i class="bi" :class="selectedPatient.id ? 'bi-pencil-fill' : 'bi-person-plus-fill'"></i>
                {{ selectedPatient.id ? 'Editar' : 'Nuevo' }} Paciente
              </h4>
            </div>

            <div class="card-body pt-1">
              <form @submit.prevent="savePatient" class="needs-validation" novalidate>
                <div class="row g-3">
                  <!-- Identification Section -->
                  <div class="col-12">
                    <h6 class="fw-semibold mb-3 border-bottom pb-2">Identificación</h6>
                  </div>

                  <div class="col-md-6">
                    <label for="identifierSystem" class="form-label">Sistema</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light">
                        <i class="bi bi-tag-fill text-muted"></i>
                      </span>
                      <input
                        id="identifierSystem"
                        type="text"
                        class="form-control"
                        v-model="selectedPatient.identifier[0].system"
                        required
                        placeholder="Ej: sistema-nacional"
                      />
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label for="identifierValue" class="form-label">Número</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light">
                        <i class="bi bi-123 text-muted"></i>
                      </span>
                      <input
                        id="identifierValue"
                        type="text"
                        class="form-control"
                        v-model="selectedPatient.identifier[0].value"
                        required
                        placeholder="Ej: 12345678"
                      />
                    </div>
                  </div>

                  <!-- Personal Info Section -->
                  <div class="col-12 mt-4">
                    <h6 class="fw-semibold mb-3 border-bottom pb-2">Información Personal</h6>
                  </div>

                  <div class="col-md-6">
                    <label for="givenName" class="form-label">Nombre(s)</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light">
                        <i class="bi bi-person-fill text-muted"></i>
                      </span>
                      <input
                        id="givenName"
                        type="text"
                        class="form-control"
                        v-model="selectedPatient.name[0].given[0]"
                        required
                        placeholder="Ej: Juan"
                      />
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label for="familyName" class="form-label">Apellido</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light">
                        <i class="bi bi-person-fill text-muted"></i>
                      </span>
                      <input
                        id="familyName"
                        type="text"
                        class="form-control"
                        v-model="selectedPatient.name[0].family"
                        placeholder="Ej: Pérez"
                      />
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label for="gender" class="form-label">Género</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light">
                        <i class="bi bi-gender-ambiguous text-muted"></i>
                      </span>
                      <select
                        id="gender"
                        class="form-select"
                        v-model="selectedPatient.gender"
                        required
                      >
                        <option value="">Seleccionar género</option>
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                        <option value="other">Otro</option>
                        <option value="unknown">Desconocido</option>
                      </select>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label for="birthDate" class="form-label">Fecha de Nacimiento</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light">
                        <i class="bi bi-calendar-date text-muted"></i>
                      </span>
                      <input
                        id="birthDate"
                        type="date"
                        class="form-control"
                        v-model="selectedPatient.birthDate"
                        required
                      />
                      <span class="input-group-text">Edad: {{ currentAge }} años</span>
                    </div>
                  </div>

                  <!-- Submit Button -->
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
                        <template v-if="isSubmitting">
                          <span class="spinner-border spinner-border-sm me-1" role="status"></span>
                          Guardando...
                        </template>
                        <template v-else>
                          <i class="bi" :class="selectedPatient.id ? 'bi-check-circle' : 'bi-save'"></i>
                          {{ selectedPatient.id ? 'Actualizar' : 'Guardar' }}
                        </template>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Details View -->
      <div v-else-if="activeTab === 'details'" class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h4 class="mb-0 fw-semibold">
                <i class="bi bi-person-lines-fill me-2 text-primary"></i>
                Detalles del Paciente
              </h4>
              <button @click="showList" class="btn btn-sm btn-outline-secondary">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>

            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <div class="patient-detail mb-3 p-3 bg-light rounded">
                    <h6 class="text-muted mb-2 small">Identificador</h6>
                    <p class="mb-0">
                      <span class="badge bg-secondary me-2">
                        {{ selectedPatient.identifier[0]?.system || 'N/A' }}
                      </span>
                      <span class="fw-medium">{{ selectedPatient.identifier[0]?.value || 'N/A' }}</span>
                    </p>
                  </div>

                  <div class="patient-detail mb-3 p-3 bg-light rounded">
                    <h6 class="text-muted mb-2 small">Nombre completo</h6>
                    <p class="mb-0 fw-medium">{{ fullName }}</p>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="patient-detail mb-3 p-3 bg-light rounded">
                    <h6 class="text-muted mb-2 small">Género</h6>
                    <p class="mb-0">
                      <span class="badge" :class="{
                        'bg-primary': selectedPatient.gender === 'male',
                        'bg-danger': selectedPatient.gender === 'female',
                        'bg-secondary': selectedPatient.gender === 'unknown',
                        'bg-warning text-dark': selectedPatient.gender === 'other',
                      }">
                        {{
                          selectedPatient.gender === 'male' ? 'Masculino' :
                          selectedPatient.gender === 'female' ? 'Femenino' :
                          selectedPatient.gender === 'other' ? 'Otro' : 'Desconocido'
                        }}
                      </span>
                    </p>
                  </div>

                  <div class="patient-detail mb-3 p-3 bg-light rounded">
                    <h6 class="text-muted mb-2 small">Fecha de Nacimiento</h6>
                    <p class="mb-0 fw-medium">{{ selectedPatient.birthDate || 'N/A' }}</p>
                  </div>

                  <div class="patient-detail mb-3 p-3 bg-light rounded">
                    <h6 class="text-muted mb-2 small">Edad</h6>
                    <p class="mb-0 fw-medium">{{ currentAge }} años</p>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2 mt-4">
                <button @click="showEditForm(selectedPatient)" class="btn btn-outline-warning">
                  <i class="bi bi-pencil-fill me-2"></i> Editar
                </button>
                <button @click="deletePatient(selectedPatient)" class="btn btn-outline-danger">
                  <i class="bi bi-trash-fill me-2"></i> Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.patient-container {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.card {
  border-radius: 0.75rem;
  overflow: hidden;
}

.card-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.table-container {
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}

.patient-row:hover {
  background-color: rgba(13, 110, 253, 0.05);
}

.table th {
  white-space: nowrap;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  box-shadow: inset 0 -1px 0 #dee2e6;
}

.input-group-text {
  transition: all 0.2s;
}

.form-control:focus + .input-group-text {
  background-color: #e9ecef;
}

.btn {
  transition: all 0.2s;
}

.bi {
  transition: all 0.2s;
}

.patient-detail {
  transition: all 0.2s;
}

.patient-detail:hover {
  background-color: rgba(13, 110, 253, 0.05) !important;
}

@media (max-width: 991.98px) {
  .table-container {
    max-height: none;
  }
}

@media (max-width: 767.98px) {
  .card-body {
    padding: 1rem;
  }
}
</style>
