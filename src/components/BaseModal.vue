<script lang="ts" setup>
defineProps<{ visible: boolean }>()
defineEmits(['close'])

</script>

<template>
    <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-1/3">
        <button class="absolute top-2 right-2 text-gray-500" @click="$emit('close')">✖️</button>
        <slot /> <!-- Aquí puedes incluir el contenido del modal -->
      </div>
  </div>
</template>


<style scoped>
</style>
