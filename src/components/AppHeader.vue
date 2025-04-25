<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter()
const auth = useAuthStore()

const logout = () => {
  auth.logout()
  router.push('/')
}
</script>
<template>
  <header class="app-header sticky-top py-2 shadow-sm">
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <h1 class="app-title fs-4 fw-semibold mb-0 text-dark">Mi Control de Pacientes con Hipertensión</h1>
        </div>
        <div class="user-controls d-flex align-items-center gap-3">
          <span class="username fw-medium text-dark">Usuario: {{ auth.username || 'usuario' }}</span>
          <button @click="logout" class="logout-btn btn btn-outline-primary btn-sm d-flex align-items-center gap-2">
            <i class="fas fa-check-circle text-success"></i> Salir
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: white;
  z-index: 1030; /* Bootstrap's fixed z-index + 1 */
  border-bottom: 1px solid #e0e0e0;
}

.logout-btn:hover {
  background-color: var(--bs-primary);
  color: white;
}
</style>
