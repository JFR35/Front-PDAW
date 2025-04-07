<script setup lang="ts">
import { onMounted } from 'vue'
import { usePatientStore } from '@/stores/patientStore' // Corregido el import

const patientStore = usePatientStore()

onMounted(async () => {
  await patientStore.fetchPatients()
})
</script>

<template>
  <div class="container py-4">
    <h2 class="mb-3">Lista de Pacientes</h2>
    <div v-if="patientStore.patients.length > 0">
      <table class="table table-bordered table-hover">
        <thead class="table-light">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Edad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="patient in patientStore.patients" :key="patient.id">
            <td>{{ patient.id }}</td>
            <td>{{ patient.name }}</td>
            <td>{{ patient.age }}</td>
            <td>
              <button class="btn btn-sm btn-outline-primary">
                Ver detalles
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="alert alert-info">
      <p>No hay pacientes disponibles.</p>
    </div>
  </div>
</template>

<style scoped>
.table {
  margin-top: 20px;
}
.alert {
  margin-top: 20px;
}
</style>
