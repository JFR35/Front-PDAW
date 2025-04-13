<script setup lang="ts" >

</script>
<template>
  <div class="container py-4">
    <h2>Calendario de visitas</h2>
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/dashboard" class="text-decoration-none">
            <i class=""></i> Dashboard
          </router-link>
        </li>
        <li class="breadcrumb-item active" aria-current="page">Visitas</li>
      </ol>
    </nav>
  </div>
  <div class="text-center p-5">
          <h5 class="text-muted">No hay visitas registradas</h5>
          <button @click="" class="btn btn-primary mt-3">
            <i class="fas fa-check-circle text-success"></i> Agregar Visita
          </button>
    </div>
</template>
