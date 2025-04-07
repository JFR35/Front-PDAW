<script setup lang="ts">
// Aquí puedes definir el nombre de usuario si es necesario
// const username = "Nombre de Usuario";
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
  <header class="bd-primary text-black shadow-sm">
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center py-3">
        <h1>Bienvenido!</h1>
        <div class="d-flex align-items-center gap-3">
          <span class="small">Usuario: Admin</span>
          <button @click="logout" class="btn btn-sm text-black btn-outline-light">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
