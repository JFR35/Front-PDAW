<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter()
const auth = useAuthStore()

const logout = () => {
  auth.logout()
  router.push('/')
}
</script>

<template>
  <header class="app-header">
    <div class="container-fluid">
      <div class="header-content">
        <div class="d-flex align-items-center">
          <i class="fas fa-heartbeat header-logo"></i>
          <h1 class="app-title">Hipertensión Control</h1>
        </div>
        <div class="user-controls">
          <span class="username">{{ auth.username || 'usuario' }}</span>
          <button @click="logout" class="logout-btn">
            <i class="fas fa-sign-out-alt"></i> Salir
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #e0e0e0;
  padding: 0.75rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-logo {
  color: #1a6fdf;
  font-size: 1.8rem;
  margin-right: 0.75rem;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.user-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.username {
  font-weight: 500;
  color: #2c3e50;
}

.logout-btn {
  background: none;
  border: 1px solid #1a6fdf;
  color: #1a6fdf;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logout-btn:hover {
  background-color: #1a6fdf;
  color: white;
}
</style>
