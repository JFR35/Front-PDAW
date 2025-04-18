<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/auth';
import type { User } from '@/types/userType';

const userStore = useUserStore();
const authStore = useAuthStore();
const router = useRouter();

const formData = ref<Omit<User, 'userId' | 'roles'>>({ // Omitimos userId y roles del formulario
  firstName: '',
  lastName: '',
  email: '',
  password: '',
});

const errorMessage = ref<string>('');
const successMessage = ref<string>('');
const isSubmitting = ref<boolean>(false);

const validateForm = (): boolean => {
  errorMessage.value = '';

  if (!formData.value.firstName) {
    errorMessage.value = 'El nombre es requerido';
    return false;
  }
  if (!formData.value.lastName) {
    errorMessage.value = 'El apellido es requerido';
    return false;
  }
  if (!formData.value.email) {
    errorMessage.value = 'El email es requerido';
    return false;
  }
  if (!formData.value.password) {
    errorMessage.value = 'La contraseña es requerida';
    return false;
  }
  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  if (!authStore.isLoggedIn || !authStore.isAdmin) {
    errorMessage.value = 'Debe ser administrador para realizar esta acción';
    router.push('/login');
    return;
  }
  isSubmitting.value = true;

  try {
    const userData = { ...formData.value, roles: [{ name: 'ROLE_PRACTITIONER' }] }; // Asignamos el rol ROLE_PRACTITIONER
    await userStore.createUser(userData);
    successMessage.value = 'Médico registrado correctamente';
    resetForm();
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Error al registrar el médico';
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  formData.value = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  };
  errorMessage.value = '';
  setTimeout(() => successMessage.value = '', 3000);
};

onMounted(() => {
  if (!authStore.isLoggedIn || !authStore.isAdmin) {
    router.push('/login');
  }
});
</script>

<template>
  <div class="container-fluid min-vh-100 d-flex flex-column p-0">
    <div class="row flex-grow-1 g-0">
      <div class="col-lg-6 d-flex align-items-center justify-content-center p-4 bg-white">
        <div class="w-100" style="max-width: 500px">
          <h2 class="mb-4">Registrar Nuevo Médico</h2>

          <div v-if="errorMessage" class="alert alert-danger" role="alert">
            {{ errorMessage }}
          </div>
          <div v-if="successMessage" class="alert alert-success" role="alert">
            {{ successMessage }}
          </div>

          <form @submit.prevent="handleSubmit" class="needs-validation" novalidate>
            <div class="mb-3">
              <label class="form-label fw-semibold">Nombre</label>
              <input
                type="text"
                class="form-control"
                placeholder="Nombre"
                v-model="formData.firstName"
                required
              />
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">Apellido</label>
              <input
                type="text"
                class="form-control"
                placeholder="Apellido"
                v-model="formData.lastName"
                required
              />
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">Email</label>
              <input
                type="email"
                class="form-control"
                placeholder="Correo electrónico"
                v-model="formData.email"
                required
              />
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">Contraseña</label>
              <input
                type="password"
                class="form-control"
                placeholder="Contraseña"
                v-model="formData.password"
                required
              />
            </div>

            <div class="mb-3 text-end">
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Registrar Médico
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="col-lg-6 p-4">
        <div class="card shadow-sm">
          <div class="card-header bg-white">
            <h5 class="mb-0">Médicos Registrados (Temporal)</h5>
          </div>
          <div class="card-body">
            <div v-if="userStore.loading" class="text-center py-3">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
            </div>
            <div v-else-if="userStore.users.filter(user => user.roles?.some(role => role.name === 'ROLE_PRACTITIONER')).length === 0" class="text-center py-3">
              No hay médicos registrados aún.
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in userStore.users.filter(user => user.roles?.some(role => role.name === 'ROLE_PRACTITIONER'))" :key="user.userId">
                    <td>{{ user.firstName }}</td>
                    <td>{{ user.lastName }}</td>
                    <td>{{ user.email }}</td>
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
