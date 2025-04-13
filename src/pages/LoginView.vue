<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const authStore = useAuthStore()
const router = useRouter()
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''

  const success = await authStore.login(email.value, password.value)

  if (success) {
    router.push('/dashboard')
  } else {
    errorMessage.value = 'Credenciales incorrectas'
  }

  isLoading.value = false
}
</script>

<template>
  <div class="login-container">
    <!-- Fondo de imagen completa -->
    <div class="background-image"></div>

    <!-- Capa oscura semitransparente -->
    <div class="overlay-layer"></div>

    <!-- Contenido del formulario -->
    <div class="form-container">
      <div class="login-card">
        <!--
        <div class="logo-container">
          <img src="@/assets/img/tension.jpg" alt="Logo" class="logo">
        </div>
      -->
        <h2 class="welcome-text">Bienvenido</h2>
        <p class="subtitle">Sistema de Control de Pacientes Hipertensos</p>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              v-model="email"
              placeholder="tucorreo@ejemplo.com"
              required
              class="input-field"
            >
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              type="password"
              id="password"
              v-model="password"
              placeholder="••••••••"
              required
              class="input-field"
            >
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <button type="submit" class="login-button" :disabled="isLoading">
            <span v-if="isLoading">Cargando...</span>
            <span v-else>Iniciar sesión</span>
          </button>

          <div class="forgot-password">
            <router-link to="/forgot-password">¿Olvidaste tu contraseña?</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 0;
  padding: 0;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/img/tension.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

.overlay-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2;
}

.form-container {
  position: relative;
  z-index: 3;
  width: 100%;
  max-width: 450px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
}

.login-card {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.logo-container {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  max-width: 120px;
  height: auto;
}

.welcome-text {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  text-align: center;
}

.subtitle {
  font-size: 1rem;
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 500;
}

.input-field {
  padding: 0.8rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-field:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
}

.error-message {
  color: #e74c3c;
  font-size: 0.9rem;
  text-align: center;
  padding: 0.5rem;
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: 5px;
}

.login-button {
  padding: 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-button:hover {
  background-color: #2980b9;
}

.login-button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.forgot-password {
  text-align: center;
  margin-top: 1rem;
}

.forgot-password a {
  color: #7f8c8d;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.forgot-password a:hover {
  color: #3498db;
}

@media (max-width: 768px) {
  .form-container {
    max-width: 100%;
    background: rgba(255, 255, 255, 0.98);
  }

  .background-image {
    display: none;
  }

  .overlay-layer {
    display: none;
  }
}
</style>
