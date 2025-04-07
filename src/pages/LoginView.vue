<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const handleLogin = () => {
  auth.login('Juanito') // Marca como Logado
  // Simulación de autenticación exitosa
  console.log('Login realizado')
  router.push('/dashboard')
}
</script>

<template>
  <div class="container-fluid vh-100 p-0 d-flex flex-column flex-md-row">
    <!-- Contenedor izquierdo (imagen/bienvenida) - visible solo en desktop -->
    <div
      class="d-none d-md-flex col-md-6 bg-primary align-items-center justify-content-center text-white p-5"
    >
      <div class="text-center">
        <h1 class="display-4 mb-4">Bienvenido</h1>
        <p class="lead">Sistema de Gestión de Pacientes para Hipertensión</p>
        <img
          src="/src/assets/img/LoginPage.jpg"
          alt="Sistema de Hipertensión"
          class="img-fluid mt-4 rounded"
          style="max-height: 300px"
        />
      </div>
    </div>

    <!-- Contenedor derecho (login) - siempre visible -->
    <div class="col-12 col-md-6 d-flex align-items-center justify-content-center p-4">
      <div class="card border-0 shadow-lg" style="max-width: 400px; width: 100%">
        <div class="card-body p-4">
          <h2 class="card-title text-center mb-4">Iniciar Sesión</h2>
          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input
                type="email"
                class="form-control"
                id="email"
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Contraseña</label>
              <input
                type="password"
                class="form-control"
                id="password"
                placeholder="********"
                required
              />
            </div>
            <div class="d-grid">
              <button type="submit" class="btn btn-primary btn-lg">Entrar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilo mínimo para asegurar que no haya scroll */
.container-fluid {
  overflow: hidden;
}
</style>
