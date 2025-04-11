<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import type { createPractitioner, ApiResponse } from '@/types/admin'
import api from '@/services/apiService' // Importa tu apiService

const router = useRoute()

// Estado del formulario, sin el rol
const medico = ref<Omit<createPractitioner, 'role'>>({
  firstName: '',
  lastName: '',
  email: '',
  password: ''
})

const errorMessage = ref<string>('')
const successMessage = ref<string>('')
const isSubmitting = ref<boolean>(false)

// Validación del email (sin cambios)
const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Envío del formulario
const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  // Validaciones básicas (sin cambios)
  if (!medico.value.firstName.trim()) {
    errorMessage.value = 'El nombre es requerido'
    return
  }

  if (!medico.value.lastName.trim()) {
    errorMessage.value = 'El apellido es requerido'
    return
  }

  if (!medico.value.email.trim()) {
    errorMessage.value = 'El email es requerido'
    return
  }

  if (!isValidEmail(medico.value.email)) {
    errorMessage.value = 'Por favor ingrese un email válido'
    return
  }

  if (!medico.value.password) {
    errorMessage.value = 'La contraseña es requerida'
    return
  }

  isSubmitting.value = true

  try {
    const response = await api.post<ApiResponse<createPractitioner>>('/api/admin/users/practitioners', medico.value)

    if (response.data.success) {
      successMessage.value = response.data.message || 'Médico registrado correctamente'
      // Limpiar formulario después de éxito
      medico.value = {
        firstName: '',
        lastName: '',
        email: '',
        password: ''
      }
    } else {
      errorMessage.value = response.data.message || 'Error al registrar el médico.'
    }
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Error al registrar el médico. Por favor intente nuevamente.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="container-fluid vh-100 p-0 d-flex flex-column flex-md-row">
    <div class="col-12 col-md-6 d-flex align-items-center justify-content-center p-4">
      <div class="card border-0 shadow-lg" style="max-width: 500px; width: 100%">
        <div class="card-body p-4">
          <h2 class="card-title text-center mb-4">Alta de Médico</h2>

          <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
          <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label for="firstName" class="form-label">Nombre</label>
              <input
                type="text"
                class="form-control"
                id="firstName"
                placeholder="Nombre del médico"
                required
                v-model="medico.firstName"
              />
            </div>

            <div class="mb-3">
              <label for="lastName" class="form-label">Apellido</label>
              <input
                type="text"
                class="form-control"
                id="lastName"
                placeholder="Apellido del médico"
                required
                v-model="medico.lastName"
              />
            </div>

            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input
                type="email"
                class="form-control"
                id="email"
                placeholder="correo@ejemplo.com"
                required
                v-model="medico.email"
              />
            </div>

            <div class="mb-3">
              <label for="password" class="form-label">Contraseña</label>
              <input
                type="password"
                class="form-control"
                id="password"
                placeholder="Contraseña mínimo 8 caracteres"
                v-model="medico.password"
              />
            </div>

            <div class="d-grid">
              <button
                type="submit"
                class="btn btn-primary btn-lg"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting">
                  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Procesando...
                </span>
                <span v-else>Registrar Médico</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="col-md-6 d-none d-md-flex bg-primary text-white align-items-center justify-content-center">
      <div class="text-center p-5">
        <h1 class="display-4 mb-4">Sistema de Gestión Médica</h1>
        <p class="lead">Registre nuevos médicos en el sistema de manera rápida y sencilla</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tu estilo (sin cambios importantes aquí) */
.card {
  border-radius: 10px;
}

.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}

@media (max-width: 768px) {
  .container-fluid {
    min-height: 100vh;
    height: auto;
  }
}
</style>
