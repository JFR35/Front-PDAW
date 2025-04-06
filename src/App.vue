<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { onMounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import BaseLayout from '@/layouts/BaseLayout.vue'

const router = useRouter()

onMounted(() => {
  // Redirigir al dashboard si ya "estamos logueados" (simulación)
  const isLoggedIn = false // Cambiar a true para simular login
  if (isLoggedIn && router.currentRoute.value.path === '/login') {
    router.push('/dashboard')
  }
})
</script>

<template>
  <BaseLayout>
    <MainLayout>
      <RouterView />
    </MainLayout>
  </BaseLayout>
</template>

<style scoped></style>
