<script lang="ts" setup>
defineProps<{ visible: boolean }>()
defineEmits(['close'])
</script>

<template>
  <div v-if="visible" class="fixed inset-0 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-2xl p-8 w-11/12 md:w-1/3">
      <button class="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl" @click="$emit('close')">✖️</button>
      <slot /> <!-- Aquí puedes incluir el contenido del modal -->
    </div>
  </div>
</template>

<style scoped>
/* Fondo transparente detrás del modal */
.fixed {
  padding: 3rem;

  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Estilo del modal */
.bg-white {
  background-color: white;
  border-radius: 12px; /* Bordes más redondeados */
  box-shadow: 0 4px 6px rgba(20, 26, 63, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08); /* Sombra más suave */
}

/* Botón de cerrar */
button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

/* Suavizar transición de opacidad */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
