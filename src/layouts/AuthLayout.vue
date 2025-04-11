<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
//import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
</script>

<template>
  <div class="layout-wrapper">
    <AppHeader />
    <main class="layout-content">
      <router-view /> <!-- Aquí aparece la vista del Dashboard una vez logado-->
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.layout-content {
  flex: 1;
  padding: 20px; /* Espaciado opcional */
}
</style>
