// Vista para la administración de médicos
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/types/userType';

const userStore = useUserStore();
const authStore = useAuthStore();
const router = useRouter();

// Definición de los datos para el formulario de registro de usuario
const formData = ref<Omit<User, 'userId' | 'roles'>>({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
});

const editingUserId = ref<number | null>(null);
const errorMessage = ref<string>('');
const successMessage = ref<string>('');
const isSubmitting = ref<boolean>(false);

// Validación del formulario antes de enviar, refactorizar para evitar duplicación de código
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
  if (!editingUserId.value && !formData.value.password) {
    errorMessage.value = 'La contraseña es requerida para nuevos usuarios';
    return false;
  }
  return true;
};

// Manejo del envío del formulario
const handleSubmit = async () => {
  if (!validateForm()) return;
  if (!authStore.isLoggedIn || !authStore.isAdmin) {
    errorMessage.value = 'Debe ser administrador para realizar esta acción';
    router.push('/login'); // Redirigir al login si no está autenticado
    return;
  }
  // Evitar envios mas de una vez
  isSubmitting.value = true;

  try {
    const userData = {
      ...formData.value,
      roles: ['ROLE_PRACTITIONER'],
      ...(editingUserId.value ? { userId: editingUserId.value } : {})
    };

    if (editingUserId.value) {
      await userStore.updateUser(userData);
      successMessage.value = 'Médico actualizado correctamente';
    } else {
      await userStore.createUser(userData);
      successMessage.value = 'Médico registrado correctamente';
    }

    // Reinicio del form y carga de usuarios ya registrados
    resetForm();
    await userStore.loadMedicUsers();
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Error al procesar la solicitud';
  } finally {
    isSubmitting.value = false;
  }
};
// Funciones para editar y eliminar usuarios
const editUser = (user: User) => {
  editingUserId.value = user.userId;
  formData.value = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: '', // No mostramos la contraseña existente
  };
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const deleteUser = async (userId: number) => {
  const confirmed = window.confirm(
    '¿Está seguro que desea eliminar este médico? Esta acción no se puede deshacer.'
  );

  if (confirmed) {
    try {
      await userStore.deleteUser(userId);
      successMessage.value = 'Médico eliminado correctamente';
      await userStore.loadMedicUsers();
    } catch (error) {
      errorMessage.value = 'Error al eliminar el médico';
    }
  }
};
// Esta función reinicia el formulario y los mensajes de error o éxito
const resetForm = () => {
  editingUserId.value = null;
  formData.value = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  };
  errorMessage.value = '';
  setTimeout(() => successMessage.value = '', 3000); // Limpiar mensaje de éxito después de 3 segundos
};
// Verificar si el usuario está autenticado y además es administrador
onMounted(() => {
  if (!authStore.isLoggedIn || !authStore.isAdmin) {
    router.push('/login'); // Redirigir al login si no está autenticado
  } else {
    userStore.loadMedicUsers();
  }
});
</script>
<template>
  <div class="admin-container">
    <!-- Breadcrumb o migas de pan para volver atrás-->
    <div class="container-fluid py-3 bg-light border-bottom">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb mb-0">
          <li class="breadcrumb-item">
            <router-link to="/dashboard" class="text-decoration-none text-primary">
              <i class="bi bi-house-door-fill me-1"></i>Dashboard
            </router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            <i class="bi bi-people-fill me-1"></i>Administración de Médicos
          </li>
        </ol>
      </nav>
    </div>
    <div class="container-fluid py-4">
      <div class="row g-4">
        <!-- Formulario -->
        <div class="col-xl-5 col-lg-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0 py-3">
              <h4 class="mb-0 fw-semibold">
                <i class="bi bi-person-plus-fill me-2 text-primary"></i>
                {{ editingUserId ? 'Editar Médico' : 'Nuevo Médico' }}
              </h4>
            </div>
            <div class="card-body pt-1">
              <!-- Mensajes de alerta -->
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

              <!-- Formulario campos -->
              <form @submit.prevent="handleSubmit" class="needs-validation" novalidate>
                <div class="row g-3">
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
                        v-model="formData.firstName"
                        required
                        :disabled="isSubmitting"
                      />
                    </div>
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
                        v-model="formData.lastName"
                        required
                        :disabled="isSubmitting"
                      />
                    </div>
                  </div>

                  <div class="col-12">
                    <label for="email" class="form-label">Email</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light">
                        <i class="bi bi-envelope-fill text-muted"></i>
                      </span>
                      <input
                        id="email"
                        type="email"
                        class="form-control"
                        v-model="formData.email"
                        required
                        :disabled="isSubmitting"
                      />
                    </div>
                  </div>

                  <div class="col-12">
                    <label for="password" class="form-label">
                      {{ editingUserId ? 'Nueva Contraseña (opcional)' : 'Contraseña' }}
                    </label>
                    <div class="input-group">
                      <span class="input-group-text bg-light">
                        <i class="bi bi-lock-fill text-muted"></i>
                      </span>
                      <input
                        id="password"
                        type="password"
                        class="form-control"
                        v-model="formData.password"
                        :required="!editingUserId"
                        :disabled="isSubmitting"
                      />
                    </div>
                  </div>

                  <div class="col-12">
                    <div class="d-flex justify-content-end gap-2 pt-2">
                      <button
                        v-if="editingUserId"
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="resetForm"
                        :disabled="isSubmitting"
                      >
                        <i class="bi bi-x-circle me-1"></i> Cancelar
                      </button>
                      <button
                        type="submit"
                        class="btn btn-primary"
                        :disabled="isSubmitting"
                      >
                        <template v-if="isSubmitting">
                          <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                          Procesando...
                        </template>
                        <template v-else>
                          <i class="bi" :class="editingUserId ? 'bi-check-circle' : 'bi-save'"></i>
                          {{ editingUserId ? 'Actualizar' : 'Registrar' }}
                        </template>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Mostrar listado de médicos, convendría añadir pagínacion y elementos de ordenación y búsqueda -->
        <div class="col-xl-7 col-lg-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h4 class="mb-0 fw-semibold">
                <i class="bi bi-people-fill me-2 text-primary"></i>
                Médicos Registrados
              </h4>
              <span class="badge bg-primary rounded-pill">
                {{ userStore.medicUsers.length }}
              </span>
            </div>

            <div class="card-body p-0">
              <!-- Bootstrap para mensajes "cargando"  -->
              <div v-if="userStore.loading" class="d-flex justify-content-center align-items-center py-5">
                <div class="text-center">
                  <div class="spinner-border text-primary mb-3" role="status">
                    <span class="visually-hidden">Cargando...</span>
                  </div>
                  <p class="text-muted">Cargando registros...</p>
                </div>
              </div>

              <!-- Mensaje si no hay médicos registrados -->
              <div v-else-if="userStore.medicUsers.length === 0" class="d-flex flex-column justify-content-center align-items-center py-5 text-center">
                <i class="bi bi-people text-muted" style="font-size: 3rem;"></i>
                <h5 class="mt-3 text-muted">No hay médicos registrados</h5>
                <p class="text-muted">Comience agregando un nuevo médico</p>
              </div>

              <!-- Tabla de listar medicos, las acciones dirigen al modal -->
              <div v-else class="table-container">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light sticky-top">
                    <tr>
                      <th class="ps-4">Nombre</th>
                      <th>Apellido</th>
                      <th>Email</th>
                      <th class="text-end pe-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in userStore.medicUsers" :key="user.userId" class="user-row">
                      <td class="ps-4 fw-medium">{{ user.firstName }}</td>
                      <td>{{ user.lastName }}</td>
                      <td>
                        <span class="d-inline-block text-truncate" style="max-width: 150px;">
                          {{ user.email }}
                        </span>
                      </td>
                      <td class="text-end pe-4">
                        <div class="btn-group btn-group-sm" role="group">
                          <button
                            @click="editUser(user)"
                            class="btn btn-outline-primary"
                            title="Editar"
                            :disabled="isSubmitting"
                          >
                            <i class="bi bi-pencil-square"></i>
                          </button>
                          <button
                            @click="deleteUser(user.userId)"
                            class="btn btn-outline-danger"
                            title="Eliminar"
                            :disabled="isSubmitting"
                          >
                            <i class="bi bi-trash"></i>
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
      </div>
    </div>
  </div>


  <!-- Ejemplo de paginación-->
  <nav aria-label="Page navigation example">
  <ul class="pagination">
    <li class="page-item">
      <a class="page-link" href="#" aria-label="Previous">
        <span aria-hidden="true">&laquo;</span>
        <span class="sr-only">Previous</span>
      </a>
    </li>
    <li class="page-item"><a class="page-link" href="#">1</a></li>
    <li class="page-item"><a class="page-link" href="#">2</a></li>
    <li class="page-item"><a class="page-link" href="#">3</a></li>
    <li class="page-item">
      <a class="page-link" href="#" aria-label="Next">
        <span aria-hidden="true">&raquo;</span>
        <span class="sr-only">Next</span>
      </a>
    </li>
  </ul>
</nav>
</template>

<style scoped>
.admin-container {
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
  max-height: calc(100vh - 250px);
  overflow-y: auto;
}

.user-row:hover {
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

@media (max-width: 991.98px) {
  .table-container {
    max-height: none;
  }
}

@media (max-width: 767.98px) {
  .card-body {
    padding: 1rem;
  }

  .table-responsive {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .table td, .table th {
    white-space: nowrap;
  }
}
</style>
