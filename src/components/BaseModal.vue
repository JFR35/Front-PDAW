<script lang="ts" setup>
defineProps<{ visible: boolean }>()
defineEmits(['close'])
</script>
<template>
  <div v-if="visible" class="modal-backdrop d-flex align-items-center justify-content-center">
    <div class="modal-content bg-white rounded-3 shadow-lg p-4 w-100" style="max-width: 500px;">
      <button
        @click="$emit('close')"
        class="btn-close position-absolute top-0 end-0 m-3"
        aria-label="Close"
      ></button>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1050;
}

.modal-content {
  position: relative;
}
</style>
