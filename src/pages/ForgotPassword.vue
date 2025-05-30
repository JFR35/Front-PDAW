<script lang="ts">
// Pendiente de implementación para resetear la contraseña
</script>

<template>
  <form @submit.prevent="requestReset">
    <input type="email" v-model="email" placeholder="Introduce tu correo" required />
    <button type="submit">Enviar enlace</button>
  </form>
</template>
