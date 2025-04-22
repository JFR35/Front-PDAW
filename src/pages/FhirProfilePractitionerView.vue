<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { usePractitionerStore } from '@/stores/practitionerStore';
import { useRouter } from 'vue-router';
import type { FhirPractitioner } from '@/types/FhirPractitioner';
import api from '@/services/apiService';

const authStore = useAuthStore();
const practitionerStore = usePractitionerStore();
const router = useRouter();

const profileData = ref<FhirPractitioner>({
  resourceType: 'Practitioner',
  identifier: [{ system: '', value: '' }],
  name: [{ given: [''], family: '' }],
  telecom: [{ system: 'phone', value: '' }],
  address: [],
  qualification: [{ code: { coding: [{ system: '', code: '', display: '' }] } }],
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
        !profileData.value.qualification?.[0]?.code?.coding?.[0]?.system ||
        !profileData.value.qualification?.[0]?.code?.coding?.[0]?.code ||
        !profileData.value.qualification?.[0]?.code?.coding?.[0]?.display
    ) {
      errorMessage.value = 'Por favor complete todos los campos requeridos.';
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
      errorMessage.value = 'Error al guardar el perfil.';
    }
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(async () => {
  if (authStore.isLoggedIn && authStore.userId) {
    console.log('FhirProfilePractitionerView.vue - onMounted - authStore.userId:', authStore.userId);
    hasPractitionerProfile.value = await authStore.checkPractitionerProfile();
    if (hasPractitionerProfile.value) {
      try {
        const response = await api.get(`/fhir/Practitioner/${authStore.userId}`);
        profileData.value = JSON.parse(response.data.resource);
      } catch (error) {
        errorMessage.value = 'Error al cargar el perfil existente.';
      }
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
            <input
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errorMessage && !profileData.identifier[0].system }"
              id="identifierSystem"
              v-model="profileData.identifier[0].system"
              required
            >
            <div class="invalid-feedback" v-if="!profileData.identifier[0].system">El sistema es obligatorio.</div>
          </div>
          <div class="col-md-6">
            <label for="identifierValue" class="form-label">Valor</label>
            <input
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errorMessage && !profileData.identifier[0].value }"
              id="identifierValue"
              v-model="profileData.identifier[0].value"
              required
            >
            <div class="invalid-feedback" v-if="!profileData.identifier[0].value">El valor es obligatorio.</div>
          </div>
        </div>
      </div>

      <div class="mb-3">
        <label for="firstName" class="form-label">Nombre</label>
        <input
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errorMessage && !profileData.name[0].given[0] }"
          id="firstName"
          v-model="profileData.name[0].given[0]"
          required
        >
        <div class="invalid-feedback" v-if="!profileData.name[0].given[0]">El nombre es obligatorio.</div>
      </div>

      <div class="mb-3">
        <label for="lastName" class="form-label">Apellido</label>
        <input
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errorMessage && !profileData.name[0].family }"
          id="lastName"
          v-model="profileData.name[0].family"
          required
        >
        <div class="invalid-feedback" v-if="!profileData.name[0].family">El apellido es obligatorio.</div>
      </div>

      <div class="mb-3">
        <label for="phone" class="form-label">Teléfono</label>
        <input
          type="tel"
          class="form-control"
          id="phone"
          v-model="profileData.telecom[0].value"
        >
      </div>

      <div class="mb-3">
        <label for="gender" class="form-label">Género</label>
        <select
          class="form-select"
          :class="{ 'is-invalid': errorMessage && !profileData.gender }"
          id="gender"
          v-model="profileData.gender"
          required
        >
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
        <input
          type="date"
          class="form-control"
          :class="{ 'is-invalid': errorMessage && !profileData.birthDate }"
          id="birthDate"
          v-model="profileData.birthDate"
          required
        >
        <div class="invalid-feedback" v-if="!profileData.birthDate">La fecha de nacimiento es obligatoria.</div>
      </div>

      <div class="mb-3">
        <label class="form-label">Cualificación</label>
        <div v-for="(qualification, qIndex) in profileData.qualification" :key="'qualification-' + qIndex">
          <div v-for="(coding, cIndex) in qualification.code?.coding || []" :key="'coding-' + cIndex">
            <div class="row mb-2">
              <div class="col-md-4">
                <label :for="'qualification-' + qIndex + '-system-' + cIndex" class="form-label">Sistema</label>
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errorMessage && !coding.system }"
                  :id="'qualification-' + qIndex + '-system-' + cIndex"
                  v-model="coding.system"
                  required
                >
                <div class="invalid-feedback" v-if="!coding.system">El sistema es obligatorio.</div>
              </div>
              <div class="col-md-4">
                <label :for="'qualification-' + qIndex + '-code-' + cIndex" class="form-label">Código</label>
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errorMessage && !coding.code }"
                  :id="'qualification-' + qIndex + '-code-' + cIndex"
                  v-model="coding.code"
                  required
                >
                <div class="invalid-feedback" v-if="!coding.code">El código es obligatorio.</div>
              </div>
              <div class="col-md-4">
                <label :for="'qualification-' + qIndex + '-display-' + cIndex" class="form-label">Display</label>
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errorMessage && !coding.display }"
                  :id="'qualification-' + qIndex + '-display-' + cIndex"
                  v-model="coding.display"
                  required
                >
                <div class="invalid-feedback" v-if="!coding.display">El display es obligatorio.</div>
              </div>
            </div>
          </div>
        </div>
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
