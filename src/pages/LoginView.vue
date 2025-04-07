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
    <!-- Contenedor izquierdo (imagen con texto superpuesto) -->
    <div class="col-md-6 p-0 position-relative">
      <img
        src="/src/assets/img/LoginPage.jpg"
        alt="Sistema de Hipertensión"
        class="w-100 h-100"
        style="object-fit: cover;"
      />
      <div class="overlay position-absolute top-50 start-50 translate-middle text-white text-center">
        <h1 class="display-4 mb-3">Bienvenido</h1>
        <p class="lead">Mi Sistema de Control de Pacientes Hipertensos</p>
      </div>
    </div>

    <!-- Contenedor derecho (login) -->
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
img {
  object-fit: cover;
}
.overlay {
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.7);
}

@media (max-width: 768px) {
  .overlay {
    font-size: 1rem;
  }

  .card-body {
    padding: 2rem;
  }
}
</style>
