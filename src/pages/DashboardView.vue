<script setup lang="ts">
// Lógica del dashboard
</script>

<template>
  <div class="container-fluid py-4 px-3 px-md-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1 text-gray-800">Dashboard</h1>
        <p class="mb-0 text-muted">Bienvenido al panel de control</p>
      </div>
    </div>

    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      <div class="col">
        <div class="card border-left-primary shadow-sm h-100 hover-effect">
          <div class="card-body d-flex flex-column">
            <div class="d-flex align-items-center mb-3">
              <div class="icon-circle bg-primary-light">
                <i class="fas fa-calendar text-primary"></i>
              </div>
              <h5 class="card-title mb-0 ms-3">Citas Pendientes</h5>
            </div>
            <p class="card-text text-muted">Aquí podrás ver tus próximas citas.</p>
            <router-link to="/dashboard/citas" class="btn btn-sm btn-outline-primary mt-auto align-self-start">
              Ver Citas <i class="fas fa-arrow-right ms-1"></i>
            </router-link>
          </div>
        </div>
      </div>

      <div class="col">
        <div class="card border-left-success shadow-sm h-100 hover-effect">
          <div class="card-body d-flex flex-column">
            <div class="d-flex align-items-center mb-3">
              <div class="icon-circle bg-success-light">
                <i class="fas fa-user-friends text-success"></i>
              </div>
              <h5 class="card-title mb-0 ms-3">Pacientes</h5>
            </div>
            <p class="card-text text-muted">Gestiona tus observaciones.</p>
            <router-link to="/dashboard/pacientes" class="btn btn-sm btn-outline-success mt-auto align-self-start">
              Ver Pacientes <i class="fas fa-arrow-right ms-1"></i>
            </router-link>
          </div>
        </div>
      </div>

      <div class="col">
        <div class="card border-left-info shadow-sm h-100 hover-effect">
          <div class="card-body d-flex flex-column">
            <div class="d-flex align-items-center mb-3">
              <div class="icon-circle bg-info-light">
                <i class="fas fa-cog text-info"></i>
              </div>
              <h5 class="card-title mb-0 ms-3">Configuración</h5>
            </div>
            <p class="card-text text-muted">Ajusta la configuración de tu cuenta.</p>
            <router-link to="/configuracion" class="btn btn-sm btn-outline-info mt-auto align-self-start">
              Ir a Configuración <i class="fas fa-arrow-right ms-1"></i>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Efecto sutil al pasar el ratón */
.hover-effect {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-effect:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
}

/* Círculo para iconos */
.icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
}

/* Colores claros para los fondos de iconos */
.bg-primary-light {
  background-color: rgba(13, 110, 253, 0.1);
}
.bg-success-light {
  background-color: rgba(25, 135, 84, 0.1);
}
.bg-info-light {
  background-color: rgba(13, 202, 240, 0.1);
}

/* Bordes izquierdos coloreados */
.border-left-primary {
  border-left: 4px solid #0d6efd;
}
.border-left-success {
  border-left: 4px solid #198754;
}
.border-left-info {
  border-left: 4px solid #0dcaf0;
}
</style>
