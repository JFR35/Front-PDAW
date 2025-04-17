<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePractitionerStore } from '@/stores/practitionerStore';
import { useAuthStore } from '@/stores/auth';
import type { FhirPractitioner, FhirPractitionerEntity } from '@/types/FhirPractitioner';
import { useRouter } from 'vue-router';

const store = usePractitionerStore();
const authStore = useAuthStore();
const router = useRouter();

const formData = ref<FhirPractitioner>({
  resourceType: 'Practitioner',
  name: [{ family: '', given: [''] }],
  identifier: [{ system: '', value: '' }],
  telecom: [{ system: 'email', value: '' }],
  gender: undefined,
  birthDate: undefined,
  qualification: [],
  address: []
});

const editingId = ref<string | null>(null);
const errorMessage = ref<string>('');
const successMessage = ref<string>('');
const isSubmitting = ref<boolean>(false);

const validateForm = (): boolean => {
  errorMessage.value = '';

  if (!formData.value.name?.[0]?.family) {
    errorMessage.value = 'El apellido es requerido';
    return false;
  }
  if (!formData.value.name?.[0]?.given?.[0]) {
    errorMessage.value = 'El nombre es requerido';
    return false;
  }
  if (!formData.value.identifier?.[0]?.value) {
    errorMessage.value = 'El identificador es requerido';
    return false;
  }
  if (!formData.value.telecom?.some(t => t.system === 'email' && t.value)) {
    errorMessage.value = 'El email es requerido';
    return false;
  }
  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  if (!authStore.isLoggedIn) {
    errorMessage.value = 'Debe iniciar sesión para realizar esta acción';
    router.push('/login');
    return;
  }
  isSubmitting.value = true;

  try {
    const practitionerJson = JSON.stringify(formData.value);
    if (editingId.value) {
      await store.updatePractitioner(editingId.value, practitionerJson);
      successMessage.value = 'Médico actualizado correctamente';
    } else {
      const userId = authStore.username || authStore.token;
      if (!userId) throw new Error('No se encontró un ID de usuario válido');
      await store.createPractitioner(practitionerJson, userId);
      successMessage.value = 'Médico registrado correctamente';
    }
    resetForm();
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Error al procesar la solicitud';
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  formData.value = {
    resourceType: 'Practitioner',
    name: [{ family: '', given: [''] }],
    identifier: [{ system: '', value: '' }],
    telecom: [{ system: 'email', value: '' }],
    gender: undefined,
    birthDate: undefined,
    qualification: [],
    address: []
  };
  editingId.value = null;
  errorMessage.value = '';
  setTimeout(() => successMessage.value = '', 3000);
};

const editPractitioner = (practitioner: FhirPractitionerEntity) => {
  if (practitioner.parsedPractitioner) {
    formData.value = JSON.parse(JSON.stringify(practitioner.parsedPractitioner));
    editingId.value = practitioner.id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const confirmDelete = async (id: string) => {
  if (confirm('¿Está seguro de eliminar este médico?')) {
    try {
      await store.deletePractitioner(id);
      successMessage.value = 'Médico eliminado correctamente';
      setTimeout(() => successMessage.value = '', 3000);
    } catch (error: unknown) {
      errorMessage.value = error instanceof Error ? error.message : 'Error al eliminar el médico';
    }
  }
};

onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.push('/login');
  } else {
    store.loadPractitioners();
  }
});
</script>

<template>
  <div class="container-fluid min-vh-100 d-flex flex-column p-0">
    <div class="row flex-grow-1 g-0">
      <!-- Form Section -->
      <div class="col-lg-6 d-flex align-items-center justify-content-center p-4 bg-white">
        <div class="w-100" style="max-width: 500px">
          <h2 class="mb-4">{{ editingId ? 'Editar Médico' : 'Registrar Nuevo Médico' }}</h2>

          <div v-if="errorMessage" class="alert alert-danger" role="alert">
            {{ errorMessage }}
          </div>
          <div v-if="successMessage" class="alert alert-success" role="alert">
            {{ successMessage }}
          </div>

          <form @submit.prevent="handleSubmit" class="needs-validation" novalidate>
            <!-- Name Field -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Nombre</label>
              <input
                type="text"
                class="form-control"
                placeholder="Nombre"
                v-model="formData.name[0].given[0]"
                required
              />
            </div>

            <!-- Last Name Field -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Apellido</label>
              <input
                type="text"
                class="form-control"
                placeholder="Apellido"
                v-model="formData.name[0].family"
                required
              />
            </div>

            <!-- Identifier Field -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Identificador</label>
              <input
                type="text"
                class="form-control"
                placeholder="Identificador profesional"
                v-model="formData.identifier[0].value"
                required
              />
            </div>

            <!-- Email Field -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Email</label>
              <input
                type="email"
                class="form-control"
                placeholder="Correo electrónico"
                :value="formData.telecom?.find(t => t.system === 'email')?.value || ''"
                @input="(e) => {
                  const email = formData.telecom?.find(t => t.system === 'email');
                  if (email) {
                    email.value = (e.target as HTMLInputElement).value;
                  } else {
                    formData.telecom = [...(formData.telecom || []), { system: 'email', value: (e.target as HTMLInputElement).value }];
                  }
                }"
                required
              />
            </div>

            <!-- Submit Buttons -->
            <div class="mb-3 text-end">
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                {{ editingId ? 'Actualizar' : 'Registrar' }}
              </button>
              <button
                type="button"
                class="btn btn-secondary ms-2"
                @click="resetForm"
                v-if="editingId"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- List Section -->
      <div class="col-lg-6 p-4">
        <div class="card shadow-sm">
          <div class="card-header bg-white">
            <h5 class="mb-0">Listado de Médicos</h5>
          </div>
          <div class="card-body">
            <div v-if="store.loading" class="text-center py-3">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
            </div>

            <div v-else-if="store.practitioners.length === 0" class="text-center py-3">
              No hay médicos registrados
            </div>

            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Identificador</th>
                    <th>Email</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="practitioner in store.practitioners" :key="practitioner.id">
                    <td>
                      {{ practitioner.parsedPractitioner?.name?.[0]?.given?.[0] }}
                      {{ practitioner.parsedPractitioner?.name?.[0]?.family }}
                    </td>
                    <td>
                      {{ practitioner.parsedPractitioner?.identifier?.[0]?.value }}
                    </td>
                    <td>
                      {{ practitioner.parsedPractitioner?.telecom?.find(t => t.system === 'email')?.value }}
                    </td>
                    <td>
                      <button
                        class="btn btn-sm btn-outline-primary me-2"
                        @click="editPractitioner(practitioner)"
                      >
                        Editar
                      </button>
                      <button
                        class="btn btn-sm btn-outline-danger"
                        @click="confirmDelete(practitioner.id)"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-responsive {
  max-height: 70vh;
  overflow-y: auto;
}

.card {
  border-radius: 0.5rem;
}

.alert {
  margin-bottom: 1rem;
}

.form-control {
  border-radius: 0.375rem;
}
</style>
