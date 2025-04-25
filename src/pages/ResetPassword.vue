<template>
  <form @submit.prevent="resetPassword">
    <input type="password" v-model="password" placeholder="Nueva contraseña" required />
    <button type="submit">Restablecer</button>
  </form>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const token = route.query.token as string
const password = ref('')
const auth = useAuthStore()

async function resetPassword() {
  await auth.resetPassword(token, password.value)
}
</script>
