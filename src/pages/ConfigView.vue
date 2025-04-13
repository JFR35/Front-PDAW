<script setup lang="ts">
import { ref } from 'vue'
import type { createPractitioner, ApiResponse } from '@/types/admin'
import api from '@/services/apiService'

const medico = ref<Omit<createPractitioner, 'role'>>({
  firstName: '',
  lastName: '',
  email: '',
  password: ''
})
const errorMessage = ref<string>('')
const successMessage = ref<string>('')
const isSubmitting = ref<boolean>(false)

const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''

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
    const response = await api.post<ApiResponse<createPractitioner>>('/users/practitioners', medico.value)

    if (response.data.success) {
      successMessage.value = response.data.message || 'Médico registrado correctamente'
      medico.value = { firstName: '', lastName: '', email: '', password: '' }
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
  <div class="container-fluid min-vh-100 d-flex flex-column p-0">
    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb" class="bg-light py-3 px-4 mb-0">
      <ol class="breadcrumb mb-0">
        <li class="breadcrumb-item">
          <router-link to="/dashboard" class="text-decoration-none">
            <i class=""></i> Dashboard
          </router-link>
        </li>
        <li class="breadcrumb-item active" aria-current="page">Alta de Médico</li>
      </ol>
    </nav>

    <div class="row flex-grow-1 g-0">
      <!-- Formulario -->
      <div class="col-lg-6 d-flex align-items-center justify-content-center p-4 bg-white">
        <div class="w-100" style="max-width: 500px;">
          <div class="text-center mb-4">
            <h2 class="fw-bold text-primary">
              <i class="fas fa-user-md me-2"></i>Alta de Médico
            </h2>
            <p class="text-muted">Complete los datos del profesional médico</p>
          </div>

          <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show">
            {{ errorMessage }}
            <button type="button" class="btn-close" @click="errorMessage = ''"></button>
          </div>

          <div v-if="successMessage" class="alert alert-success alert-dismissible fade show">
            {{ successMessage }}
            <button type="button" class="btn-close" @click="successMessage = ''"></button>
          </div>

          <form @submit.prevent="handleSubmit" class="needs-validation" novalidate>
            <div class="mb-3">
              <label for="firstName" class="form-label fw-semibold">Nombre</label>
              <div class="input-group">
                <span class="input-group-text bg-primary bg-opacity-10 text-primary">
                  <i class="fas fa-user"></i>
                </span>
                <input
                  type="text"
                  class="form-control"
                  id="firstName"
                  placeholder="Nombre del médico"
                  required
                  v-model="medico.firstName"
                >
              </div>
            </div>

            <div class="mb-3">
              <label for="lastName" class="form-label fw-semibold">Apellido</label>
              <div class="input-group">
                <span class="input-group-text bg-primary bg-opacity-10 text-primary">
                  <i class="fas fa-user"></i>
                </span>
                <input
                  type="text"
                  class="form-control"
                  id="lastName"
                  placeholder="Apellido del médico"
                  required
                  v-model="medico.lastName"
                >
              </div>
            </div>

            <div class="mb-3">
              <label for="email" class="form-label fw-semibold">Email</label>
              <div class="input-group">
                <span class="input-group-text bg-primary bg-opacity-10 text-primary">
                  <i class="fas fa-envelope"></i>
                </span>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  placeholder="correo@ejemplo.com"
                  required
                  v-model="medico.email"
                >
              </div>
            </div>

            <div class="mb-4">
              <label for="password" class="form-label fw-semibold">Contraseña</label>
              <div class="input-group">
                <span class="input-group-text bg-primary bg-opacity-10 text-primary">
                  <i class="fas fa-lock"></i>
                </span>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  placeholder="Mínimo 8 caracteres"
                  required
                  minlength="8"
                  v-model="medico.password"
                >
              </div>
              <div class="form-text">La contraseña debe tener al menos 8 caracteres</div>
            </div>

            <div class="d-grid">
              <button
                type="submit"
                class="btn btn-primary btn-lg py-3 fw-semibold"
                :disabled="isSubmitting"
              >
                <template v-if="isSubmitting">
                  <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Procesando...
                </template>
                <template v-else>
                  <i class="fas fa-save me-2"></i> Registrar Médico
                </template>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Panel derecho -->
      <div class="col-lg-6 d-none d-lg-flex bg-primary bg-gradient align-items-center justify-content-center p-5">
        <div class="text-white text-center">
          <i class="fas fa-hospital-user display-1 mb-4"></i>
          <h1 class="display-5 fw-bold mb-4">Sistema de Gestión Médica</h1>
          <p class="lead opacity-75">Simplifique el registro y administración de profesionales médicos</p>
          <div class="mt-5 pt-4 border-top border-white border-opacity-25">
            <p class="small opacity-75">
              <i class="fas fa-shield-alt me-2"></i> Todos los datos están protegidos
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Solo estilos esenciales que no pueden lograrse con Bootstrap */
.bg-gradient {
  background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
}

@media (max-width: 992px) {
  .min-vh-100 {
    min-height: auto !important;
  }
}
</style>
