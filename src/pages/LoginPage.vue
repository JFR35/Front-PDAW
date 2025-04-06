<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogin = () => {
  // Simulación de autenticación exitosa
  console.log('Login realizado')
  router.push('/dashboard')
}
</script>

<template>
  <div class="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
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
</template>

<style scoped>
/* No necesitamos estilos específicos aquí, Bootstrap se encarga del layout */
</style>
