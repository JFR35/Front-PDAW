<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { usePractitionerStore } from '@/stores/practitionerStore';
import { useRouter } from 'vue-router';
import type { FhirPractitioner } from '@/types/PractitionerTyped';

const qualificationOptions = [
  { code: 'MD', display: 'Doctor of Medicine', system: 'http://terminology.hl7.org/CodeSystem/v2-0360' },
  { code: 'RN', display: 'Registered Nurse', system: 'http://terminology.hl7.org/CodeSystem/v2-0360' },
  { code: 'NP', display: 'Nurse Practitioner', system: 'http://terminology.hl7.org/CodeSystem/v2-0360' },
];

const authStore = useAuthStore();
const practitionerStore = usePractitionerStore();
const router = useRouter();

const profileData = ref<FhirPractitioner>({
  resourceType: 'Practitioner',
  meta: {
    profile: ['http://myhealthapp.org/fhir/StructureDefinition/mi-practitioner-persistencia'],
  },
  identifier: [{ system: '', value: '' }],
  name: [{ given: [''], family: '' }],
  qualification: [{ code: { coding: [{ system: qualificationOptions[0].system, code: qualificationOptions[0].code, display: qualificationOptions[0].display }] } }],
  gender: '',
  birthDate: '',
});

const errorMessage = ref('');
const successMessage = ref('');
const isSubmitting = ref(false);
const hasPractitionerProfile = ref(false);

const saveProfile = async () => {
  isSubmitting.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    if (!authStore.isLoggedIn || !authStore.token || authStore.userId === null || authStore.userId === undefined) {
      errorMessage.value = 'Error: Usuario no autenticado o ID de usuario no encontrado.';
      return;
    }

    if (!profileData.value.identifier?.[0]?.system ||
        !profileData.value.identifier?.[0]?.value ||
        !profileData.value.name?.[0]?.family ||
        !profileData.value.name?.[0]?.given?.[0] ||
        !profileData.value.gender ||
        !profileData.value.birthDate ||
        !profileData.value.qualification?.[0]?.code?.coding?.[0]?.code
    ) {
      errorMessage.value = 'Por favor complete todos los campos requeridos, incluyendo una cualificación válida.';
      return;
    }

    await practitionerStore.createPractitioner(profileData.value);

    successMessage.value = 'Perfil guardado correctamente.';
    hasPractitionerProfile.value = true;
    router.push({ name: 'dashboard' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      errorMessage.value = error.message;
    } else {
      errorMessage.value = 'Error al guardar el perfil. Asegúrese de que todos los campos son válidos.';
    }
  } finally {
    isSubmitting.value = false;
  }
};
onMounted(async () => {
  if (!authStore.isLoggedIn || !authStore.isPractitioner) {
    errorMessage.value = 'Acceso denegado. Solo los profesionales pueden ver y gestionar su perfil.';
    return;
  }

  const userIdFromAuth = authStore.userId;
  if (!userIdFromAuth) {
    errorMessage.value = 'ID de usuario no disponible para cargar el perfil del practicante.';
    return;
  }

  try {
    // Try to get practitioner by national ID (using userId as fallback)
    const nationalIdToSearch = authStore.userNationalId || userIdFromAuth;
    const existingProfile = await practitionerStore.getPractitionerByNationalId(nationalIdToSearch);

    if (existingProfile) {
      profileData.value = existingProfile;
      hasPractitionerProfile.value = true;
    } else {
      // Initialize new practitioner profile
      profileData.value = {
        resourceType: 'Practitioner',
        meta: {
          profile: ['http://myhealthapp.org/fhir/StructureDefinition/mi-practitioner-persistencia'],
        },
        identifier: [{
          system: 'http://myhealthapp.org/fhir/identifier/national-id',
          value: nationalIdToSearch
        }],
        name: [{ given: [''], family: '' }],
        qualification: [{
          code: {
            coding: [{
              system: qualificationOptions[0].system,
              code: qualificationOptions[0].code,
              display: qualificationOptions[0].display
            }]
          }
        }],
        gender: '',
        birthDate: '',
      };
      hasPractitionerProfile.value = false;
    }
  } catch (error) {
    errorMessage.value = 'Error al cargar el perfil del practicante.';
    console.error('Error loading practitioner profile:', error);
  }
});
</script>

<template>
  <div class="profile-container">
    <!-- Breadcrumb -->
    <div class="container-fluid py-3 bg-light border-bottom">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb mb-0">
          <li class="breadcrumb-item">
            <router-link to="/dashboard" class="text-decoration-none text-primary">
              <i class="bi bi-house-door-fill me-1"></i>Dashboard
            </router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            <i class="bi bi-person-badge-fill me-1"></i>Perfil Profesional
          </li>
        </ol>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="container-fluid py-4">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0 py-3">
              <h4 class="mb-0 fw-semibold">
                <i class="bi bi-person-badge-fill me-2 text-primary"></i>
                {{ hasPractitionerProfile ? 'Actualizar Perfil' : 'Completar Perfil Profesional' }}
              </h4>
            </div>

            <div class="card-body pt-1">
              <!-- Alert Messages -->
              <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                {{ errorMessage }}
                <button type="button" class="btn-close" @click="errorMessage = ''"></button>
              </div>

              <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="bi bi-check-circle-fill me-2"></i>
                {{ successMessage }}
                <button type="button" class="btn-close" @click="successMessage = ''"></button>
              </div>

              <div v-if="!hasPractitionerProfile" class="alert alert-info">
                <i class="bi bi-info-circle-fill me-2"></i>
                Tu perfil de profesional está incompleto. Por favor, complétalo para poder acceder a todas las funcionalidades.
              </div>

              <!-- Form -->
              <form @submit.prevent="saveProfile" class="needs-validation" novalidate>
                <div class="row g-3">
                  <!-- Identifier -->
                  <div class="col-12">
                    <h6 class="fw-semibold mb-3 border-bottom pb-2">Identificación Profesional</h6>
                  </div>

                  <div class="col-md-6">
                    <label for="identifierSystem" class="form-label">Sistema de Identificación</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light">
                        <i class="bi bi-tag-fill text-muted"></i>
                      </span>
                      <input
                        id="identifierSystem"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': errorMessage && !profileData.identifier[0].system }"
                        v-model="profileData.identifier[0].system"
                        required
                        :disabled="isSubmitting"
                        placeholder="Ej: sistema-nacional"
                      />
                    </div>
                    <div class="invalid-feedback" v-if="!profileData.identifier[0].system">El sistema es obligatorio.</div>
                  </div>

                  <div class="col-md-6">
                    <label for="identifierValue" class="form-label">Número de Identificación</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light">
                        <i class="bi bi-123 text-muted"></i>
                      </span>
                      <input
                        id="identifierValue"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': errorMessage && !profileData.identifier[0].value }"
                        v-model="profileData.identifier[0].value"
                        required
                        :disabled="isSubmitting"
                        placeholder="Ej: 90931948M"
                      />
                    </div>
                    <div class="invalid-feedback" v-if="!profileData.identifier[0].value">El número es obligatorio.</div>
                  </div>

                  <!-- Personal Info -->
                  <div class="col-12 mt-4">
                    <h6 class="fw-semibold mb-3 border-bottom pb-2">Información Personal</h6>
                  </div>

                  <div class="col-md-6">
                    <label for="firstName" class="form-label">Nombre</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light">
                        <i class="bi bi-person-fill text-muted"></i>
                      </span>
                      <input
                        id="firstName"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': errorMessage && !profileData.name[0].given[0] }"
                        v-model="profileData.name[0].given[0]"
                        required
                        :disabled="isSubmitting"
                      />
                    </div>
                    <div class="invalid-feedback" v-if="!profileData.name[0].given[0]">El nombre es obligatorio.</div>
                  </div>

                  <div class="col-md-6">
                    <label for="lastName" class="form-label">Apellido</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light">
                        <i class="bi bi-person-fill text-muted"></i>
                      </span>
                      <input
                        id="lastName"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': errorMessage && !profileData.name[0].family }"
                        v-model="profileData.name[0].family"
                        required
                        :disabled="isSubmitting"
                      />
                    </div>
                    <div class="invalid-feedback" v-if="!profileData.name[0].family">El apellido es obligatorio.</div>
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
                        :class="{ 'is-invalid': errorMessage && !profileData.gender }"
                        v-model="profileData.gender"
                        required
                        :disabled="isSubmitting"
                      >
                        <option value="">Seleccionar género</option>
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                        <option value="other">Otro</option>
                        <option value="unknown">Desconocido</option>
                      </select>
                    </div>
                    <div class="invalid-feedback" v-if="!profileData.gender">El género es obligatorio.</div>
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
                        :class="{ 'is-invalid': errorMessage && !profileData.birthDate }"
                        v-model="profileData.birthDate"
                        required
                        :disabled="isSubmitting"
                      />
                    </div>
                    <div class="invalid-feedback" v-if="!profileData.birthDate">La fecha es obligatoria.</div>
                  </div>

                  <!-- Professional Info -->
                  <div class="col-12 mt-4">
                    <h6 class="fw-semibold mb-3 border-bottom pb-2">Información Profesional</h6>
                  </div>

                  <div class="col-12">
                    <label for="qualification" class="form-label">Cualificación</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light">
                        <i class="bi bi-award-fill text-muted"></i>
                      </span>
                      <select
                        id="qualification"
                        class="form-select"
                        :class="{ 'is-invalid': errorMessage && !profileData.qualification[0].code.coding[0].code }"
                        v-model="profileData.qualification[0].code.coding[0].code"
                        required
                        :disabled="isSubmitting"
                      >
                        <option value="">Seleccionar cualificación</option>
                        <option v-for="option in qualificationOptions" :value="option.code" :key="option.code">
                          {{ option.display }}
                        </option>
                      </select>
                    </div>
                    <div class="invalid-feedback" v-if="!profileData.qualification[0].code.coding[0].code">La cualificación es obligatoria.</div>
                  </div>

                  <!-- Submit Button -->
                  <div class="col-12 mt-4">
                    <div class="d-flex justify-content-end">
                      <button
                        type="submit"
                        class="btn btn-primary"
                        :disabled="isSubmitting"
                      >
                        <template v-if="isSubmitting">
                          <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                          Guardando...
                        </template>
                        <template v-else>
                          <i class="bi bi-save-fill me-1"></i>
                          {{ hasPractitionerProfile ? 'Actualizar Perfil' : 'Guardar Perfil' }}
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
    </div>
  </div>
</template>

<style scoped>
.profile-container {
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

@media (max-width: 767.98px) {
  .card-body {
    padding: 1rem;
  }
}
</style>
