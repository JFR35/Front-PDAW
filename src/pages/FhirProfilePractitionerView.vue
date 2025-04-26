<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { usePractitionerStore } from '@/stores/practitionerStore';
import { useRouter } from 'vue-router';
import type { FhirPractitioner } from '@/types/FhirPractitioner';

// Define valid qualification codes from v2-2.7-0360
const qualificationOptions = [
  { code: 'MD', display: 'Physician', system: 'http://terminology.hl7.org/CodeSystem/v2-0360' },
  { code: 'RN', display: 'Registered Nurse', system: 'http://terminology.hl7.org/CodeSystem/v2-0360' },
  { code: 'DDS', display: 'Dentist', system: 'http://terminology.hl7.org/CodeSystem/v2-0360' },
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
  telecom: [{ system: 'phone', value: '' }],
  address: [],
  qualification: [{ code: { coding: [{ system: qualificationOptions[0].system, code: qualificationOptions[0].code, display: qualificationOptions[0].display }] } }],
  gender: undefined,
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
  if (authStore.isLoggedIn) {
    try {
      const hasProfile = await authStore.checkPractitionerProfile();
      hasPractitionerProfile.value = hasProfile;
    } catch (error: unknown) {
      errorMessage.value = error instanceof Error ? error.message : 'Error al verificar el perfil.';
    }
  } else {
    errorMessage.value = 'No se ha detectado la información del usuario. Por favor, inicie sesión nuevamente.';
  }
});
</script>

<template>
  <div class="container mt-5">
    <h1>Perfil de Médico</h1>

    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

    <p v-if="!hasPractitionerProfile">Tu perfil de profesional está incompleto. Por favor, complétalo.</p>
    <p v-else>Tu perfil de profesional está completo.</p>

    <form @submit.prevent="saveProfile">
      <div class="mb-3">
        <label class="form-label">Identificador</label>
        <div class="row">
          <div class="col-md-6">
            <label for="identifierSystem" class="form-label">Sistema</label>
            <input type="text" class="form-control"
                   :class="{ 'is-invalid': errorMessage && !profileData.identifier[0].system }" id="identifierSystem"
                   v-model="profileData.identifier[0].system">
            <div class="invalid-feedback" v-if="!profileData.identifier[0].system">El sistema es obligatorio.</div>
          </div>
          <div class="col-md-6">
            <label for="identifierValue" class="form-label">Valor</label>
            <input type="text" class="form-control"
                   :class="{ 'is-invalid': errorMessage && !profileData.identifier[0].value }" id="identifierValue"
                   v-model="profileData.identifier[0].value" required>
            <div class="invalid-feedback" v-if="!profileData.identifier[0].value">El valor es obligatorio.</div>
          </div>
        </div>
      </div>

      <div class="mb-3">
        <label for="firstName" class="form-label">Nombre</label>
        <input type="text" class="form-control" :class="{ 'is-invalid': errorMessage && !profileData.name[0].given[0] }"
               id="firstName" v-model="profileData.name[0].given[0]" required>
        <div class="invalid-feedback" v-if="!profileData.name[0].given[0]">El nombre es obligatorio.</div>
      </div>

      <div class="mb-3">
        <label for="lastName" class="form-label">Apellido</label>
        <input type="text" class="form-control" :class="{ 'is-invalid': errorMessage && !profileData.name[0].family }"
               id="lastName" v-model="profileData.name[0].family" required>
        <div class="invalid-feedback" v-if="!profileData.name[0].family">El apellido es obligatorio.</div>
      </div>

      <div class="mb-3">
        <label for="phone" class="form-label">Teléfono</label>
        <input type="tel" class="form-control" id="phone" v-model="profileData.telecom[0].value">
      </div>

      <div class="mb-3">
        <label for="gender" class="form-label">Género</label>
        <select class="form-select" :class="{ 'is-invalid': errorMessage && !profileData.gender }" id="gender"
                v-model="profileData.gender" required>
          <option value="">Seleccionar género</option>
          <option value="male">Masculino</option>
          <option value="female">Femenino</option>
          <option value="other">Otro</option>
          <option value="unknown">Desconocido</option>
        </select>
        <div class="invalid-feedback" v-if="!profileData.gender">El género es obligatorio.</div>
      </div>

      <div class="mb-3">
        <label for="birthDate" class="form-label">Fecha de Nacimiento</label>
        <input type="date" class="form-control" :class="{ 'is-invalid': errorMessage && !profileData.birthDate }"
               id="birthDate" v-model="profileData.birthDate" required>
        <div class="invalid-feedback" v-if="!profileData.birthDate">La fecha de nacimiento es obligatoria.</div>
      </div>

      <div class="mb-3">
        <label for="qualification" class="form-label">Cualificación</label>
        <select class="form-select" :class="{ 'is-invalid': errorMessage && !profileData.qualification[0].code.coding[0].code }"
                id="qualification" v-model="profileData.qualification[0].code.coding[0].code" required
                @change="updateQualification($event.target.value)">
          <option value="">Seleccionar cualificación</option>
          <option v-for="option in qualificationOptions" :value="option.code" :key="option.code">
            {{ option.display }}
          </option>
        </select>
        <div class="invalid-feedback" v-if="!profileData.qualification[0].code.coding[0].code">La cualificación es obligatoria.</div>
      </div>

      <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
        <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
        Guardar Perfil
      </button>
    </form>
  </div>
</template>

<style scoped>
/* Tus estilos */
</style>
