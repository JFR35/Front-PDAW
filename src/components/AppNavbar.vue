<script setup lang="ts">
// Añadir lang="ts" para TypeScript
// Lógica del navbar si es necesaria de momento no
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNavbar"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="mainNavbar">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link to="/dashboard" class="nav-link active">Dashboard</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/pacientes" class="nav-link">Pacientes</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/citas" class="nav-link">Citas</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/configuracion" class="nav-link">Configuración</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
