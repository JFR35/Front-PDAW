<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { onMounted, watch } from 'vue'

const router = useRouter()

// Simulación de autenticación
const isLoggedIn = false // Cambiar según tu estado real

// Redirección basada en autenticación
watch(
  () => router.currentRoute.value,
  (to) => {
    if (isLoggedIn && to.name === 'login') {
      router.push('/dashboard')
    } else if (!isLoggedIn && to.meta.requiresAuth) {
      router.push('/login')
    }
  },
  { immediate: true },
)
</script>

<template>
  <RouterView />
</template>
