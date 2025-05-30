<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { ref, onMounted } from 'vue'

const auth = useAuthStore()
const upcomingAppointments = ref(0)
const isLoading = ref(true)

// Simular carga de datos
onMounted(() => {
  setTimeout(() => {
    upcomingAppointments.value = 5
    isLoading.value = false
  }, 800)
})
</script>

<template>

  <div class="dashboard-container">
    <!-- SubHeader -->
    <header class="dashboard-header">
      <div>
        <h1 class="dashboard-title">Dashboard</h1>
        <p class="dashboard-subtitle">Bienvenido al panel de control</p>
      </div>
    </header>

    <!-- Cards con las acciones -->
    <section v-if="auth.isPractitioner" class="dashboard-section">
      <h2 class="section-title">Acciones Rápidas</h2>
      <div class="card-grid">
        <!-- Mi Perfil -->
        <article class="card card-profile">
          <div class="card-body">
            <div class="card-header">
              <div class="icon-circle">
                <i class="bi bi-person-badge"></i>
              </div>
              <h3 class="card-title">Mi Perfil</h3>
            </div>
            <p class="card-text">Completa tu información profesional</p>
            <router-link to="/dashboard/practitioner" class="btn btn-card" aria-label="Ver perfil de facultativo">
              Ver Perfil <i class="bi bi-arrow-right"></i>
            </router-link>
          </div>
        </article>
        <article class="card card-patients">

          <div class="card-body">
            <div class="card-header">
              <div class="icon-circle">
                <i class="bi bi-heart-pulse"></i>
              </div>
              <h3 class="card-title">Monitorización de Presión Sanguínea</h3>
            </div>
            <p class="card-text">Visualiza y analiza la presión sanguínea de tus pacientes</p>
            <router-link to="/dashboard/bloodPressureChart" class="btn btn-card"
              aria-label="Ver gráficos de presión sanguínea">
              Ver Gráficos <i class="bi bi-arrow-right"></i>
            </router-link>
          </div>
        </article>

        <!-- Visitas -->
        <article class="card card-appointments">
          <div class="card-body">
            <div class="card-header">
              <div class="icon-circle">
                <i class="bi bi-calendar"></i>
              </div>
              <h3 class="card-title">Visitas</h3>
            </div>
            <!-- Cargar número de citas pendientes, no está funcionando-->
            <p class="card-text">
              <template v-if="!isLoading">
                Próximas citas:
                Asignación de citas pendientes
                <strong>{{ upcomingAppointments }}</strong>
              </template>
              <template v-else>
                <span class="placeholder col-6"></span>
              </template>
            </p>
            <router-link to="/dashboard/citas" class="btn btn-card" aria-label="Ver citas programadas">
              Ver Citas <i class="bi bi-arrow-right"></i>
            </router-link>
          </div>
        </article>

        <!-- Pacientes -->
        <article class="card card-patients">
          <div class="card-body">
            <div class="card-header">
              <div class="icon-circle">
                <i class="bi bi-people"></i>
              </div>
              <h3 class="card-title">Pacientes</h3>
            </div>
            <p class="card-text">Gestiona tus pacientes</p>
            <router-link to="/dashboard/pacientes" class="btn btn-card" aria-label="Ver lista de pacientes">
              Ver Pacientes <i class="bi bi-arrow-right"></i>
            </router-link>
          </div>
        </article>
      </div>
    </section>

    <!-- Sección Card del administrado -->
    <section v-if="auth.isAdmin" class="dashboard-section">
      <h2 class="section-title">Administración</h2>
      <div class="card-grid">
        <article class="card card-admin">
          <div class="card-body">
            <div class="card-header">
              <div class="icon-circle">
                <i class="bi bi-person-gear"></i>
              </div>
              <h3 class="card-title">Facultativos</h3>
            </div>
            <p class="card-text">Realiza acciones de administración sobre el personal facultativo</p>
            <router-link to="/dashboard/configuracion" class="btn btn-card"
              aria-label="Ir a configuración de facultativos">
              Ir a Administración <i class="bi bi-arrow-right"></i>
            </router-link>
          </div>
        </article>

        <!-- Aún no incorpora funcionalidad, la idea es que sea para auditoria -->
        <article class="card card-stats">
          <div class="card-body">
            <div class="card-header">
              <div class="icon-circle">
                <i class="bi bi-graph-up"></i>
              </div>
              <h3 class="card-title">Estadísticas</h3>
            </div>
            <p class="card-text">Visualiza métricas y estadísticas del sistema</p>
            <router-link to="/dashboard/estadisticas" class="btn btn-card" aria-label="Ver estadísticas">
              Ver Estadísticas <i class="bi bi-arrow-right"></i>
            </router-link>
          </div>
        </article>
      </div>
    </section>
  </div>

</template>

<style scoped>
.dashboard-container {
  position: relative;
  padding: 4.5rem;
  border-radius: 12px;
  background-color: #f8f8f8;
  max-width: 1600px;
  margin: 0 auto;
}

.dashboard-container::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/src/assets/img/tension.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.7;
  z-index: -1;
  pointer-events: none;
}
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.dashboard-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--bs-gray-800);
  margin-bottom: 0.25rem;
}

.dashboard-subtitle {
  color: var(--bs-gray-600);
  margin-bottom: 0;
}

.btn-profile {
  border: 1px solid var(--bs-gray-300);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-profile:hover {
  background-color: var(--bs-gray-100);
}

.dashboard-section {
  margin-top: 2.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--bs-gray-700);
  margin-bottom: 1.5rem;
  position: relative;
  padding-left: 1rem;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background-color: var(--bs-primary);
  border-radius: 4px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.card {
  border-radius: 12px;
  border: 1px solid var(--bs-border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: white;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.card-body {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0;
  margin-left: 0.75rem;
  color: var(--bs-gray-800);
}

.card-text {
  color: var(--bs-gray-600);
  margin-bottom: 1.5rem;
  flex: 1;
}

.btn-card {
  align-self: flex-start;
  padding: 0.5rem 1rem;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  color: var(--bs-primary);
  flex-shrink: 0;
}

.card-profile .icon-circle {
  background-color: rgba(13, 110, 253, 0.1);
  color: #0d6efd;
}

.card-profile .btn-card {
  color: #0d6efd;
  border-color: #0d6efd;
}

.card-profile .btn-card:hover {
  background-color: rgba(13, 110, 253, 0.1);
}

.card-appointments .icon-circle {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.card-appointments .btn-card {
  color: #dc3545;
  border-color: #dc3545;
}

.card-appointments .btn-card:hover {
  background-color: rgba(220, 53, 69, 0.1);
}

.card-patients .icon-circle {
  background-color: rgba(25, 135, 84, 0.1);
  color: #198754;
}

.card-patients .btn-card {
  color: #198754;
  border-color: #198754;
}

.card-patients .btn-card:hover {
  background-color: rgba(25, 135, 84, 0.1);
}

.card-admin .icon-circle {
  background-color: rgba(13, 202, 240, 0.1);
  color: #0dcaf0;
}

.card-admin .btn-card {
  color: #0dcaf0;
  border-color: #0dcaf0;
}

.card-admin .btn-card:hover {
  background-color: rgba(13, 202, 240, 0.1);
}

.card-stats .icon-circle {
  background-color: rgba(111, 66, 193, 0.1);
  color: #6f42c1;
}

.card-stats .btn-card {
  color: #6f42c1;
  border-color: #6f42c1;
}

.card-stats .btn-card:hover {
  background-color: rgba(111, 66, 193, 0.1);
}

/* Loading state */
.placeholder {
  display: inline-block;
  min-height: 1em;
  background-color: var(--bs-gray-300);
  opacity: 0.5;
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.5;
  }

  50% {
    opacity: 0.8;
  }

  100% {
    opacity: 0.5;
  }
}

/* Responsive*/
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
  }

  .card-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .dashboard-container {
    padding: 1rem;
  }

  .card-body {
    padding: 1.25rem;
  }

  .icon-circle {
    width: 2.25rem;
    height: 2.25rem;
  }
}
</style>
