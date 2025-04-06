<script setup lang="ts"></script>

<template>
  <div class="container-fluid bg-light py-5">
    <div class="container">
      <h1 class="mb-4">Dashboard</h1>
      <p class="lead">Bienvenido al panel de control.</p>

      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div class="col">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title">Citas Pendientes</h5>
              <p class="card-text">Aquí podrás ver tus próximas citas.</p>
              <a href="#" class="btn btn-primary">Ver Citas</a>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title">Pacientes</h5>
              <p class="card-text">Gestiona la lista de tus pacientes.</p>
              <a href="#" class="btn btn-primary">Ver Pacientes</a>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title">Configuración</h5>
              <p class="card-text">Ajusta la configuración de tu cuenta.</p>
              <a href="#" class="btn btn-primary">Ir a Configuración</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* No necesitamos estilos específicos aquí, Bootstrap se encarga del layout */
</style>
