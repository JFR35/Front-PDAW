<script setup lang="ts">
import AppNavbar from '@/components/AppNavbar.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
</script>

<template>
  <div>
    <AppNavbar v-if="$route.path !== '/login'" />
    <AppHeaderLogin v-if="$route.path === '/login'" />
    <AppHeader v-else />
    <router-view />
    <AppFooter v-if="$route.path !== '/login'" />
  </div>
</template>

<style></style>
