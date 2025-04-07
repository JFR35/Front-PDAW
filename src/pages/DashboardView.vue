<script setup lang="ts">
// Lógica del dashboard
</script>

<template>
  <div class="container-fluid py-4">
    <h1 class="mb-4">Dashboard</h1>
    <p class="lead">Bienvenido al panel de control.</p>

    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      <div class="col">
        <div class="card shadow-sm h-100">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">Citas Pendientes</h5>
            <p class="card-text">Aquí podrás ver tus próximas citas.</p>
            <router-link to="/dashboard/citas" class="btn btn-primary mt-auto">Ver Citas</router-link>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="card shadow-sm h-100">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">Pacientes</h5>
            <p class="card-text">Gestiona la lista de tus pacientes.</p>
            <router-link to="/dashboard/pacientes" class="btn btn-primary mt-auto">Ver Pacientes</router-link>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="card shadow-sm h-100">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">Configuración</h5>
            <p class="card-text">Ajusta la configuración de tu cuenta.</p>
            <router-link to="/configuracion" class="btn btn-primary mt-auto"
              >Ir a Configuración</router-link
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos si son necesarios */
</style>
