// Vista para la administración de visitras medicas incluyendo la medición
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useVisitStore } from '@/stores/visitStore';
import { usePatientStore } from '@/stores/patientStore';
import { usePractitionerStore } from '@/stores/practitionerStore';
import type { VisitRequestFrontend } from '@/types/VisitTyped';
// import type { VisitRequestFrontend } from '@/types/Visit';

const visitStore = useVisitStore();
const patientStore = usePatientStore();
const practitionerStore = usePractitionerStore();

// Definición del formulario para la nueva visita, contemplar usar sweet alert UXD amigable
const newVisitForm = ref<VisitRequestFrontend>({
  patientNationalId: '',
  practitionerNationalId: '',
  visitDate: undefined,
  bloodPressureMeasurement: {
    date: undefined,
    systolicMagnitude: undefined,
    systolicUnit: 'mm[Hg]',
    diastolicMagnitude: undefined,
    diastolicUnit: 'mm[Hg]',
    location: undefined,
    measuredBy: undefined,
  },
});

const showAddVisitModal = ref(false);
const includeBloodPressure = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const filterPatientNationalId = ref<string>('');
// Carga los pacientes y profesionales al montar el componente
onMounted(async () => {
  try {
    await Promise.all([
      patientStore.loadPatients(),
      practitionerStore.loadPractitioners(),
    ]);

    if (patientStore.patients.length > 0) {
      const firstValidPatient = patientStore.patients.find(
        (p) => p.identifier?.[0]?.value && p.identifier[0].value !== 'N/A'
      );
      if (firstValidPatient) {
        newVisitForm.value.patientNationalId = firstValidPatient.identifier[0].value;
        filterPatientNationalId.value = firstValidPatient.identifier[0].value;
        await visitStore.getVisitsByPatientNationalId(filterPatientNationalId.value);
      } else {
        errorMessage.value = 'No valid patients found with a national ID.';
      }
    } else {
      errorMessage.value = 'No patients available to load visits.';
    }

    if (practitionerStore.practitioners.length > 0) {
      newVisitForm.value.practitionerNationalId = practitionerStore.practitioners[0].identifier[0].value;
    }
  } catch (error) {
    console.error('Error during component mount:', error);
    errorMessage.value = 'Failed to load patients or practitioners.';
  }
});

// Modal para añadir una nueva visita
const openAddVisitModal = () => {
  const now = new Date().toISOString().slice(0, 16);
  Object.assign(newVisitForm.value, {
    visitDate: now,
    bloodPressureMeasurement: {
      date: now,
      systolicMagnitude: null,
      systolicUnit: 'mm[Hg]',
      diastolicMagnitude: null,
      diastolicUnit: 'mm[Hg]',
      location: 'Right arm',
      measuredBy: '',
    },
  });

  includeBloodPressure.value = false;
  errorMessage.value = null;
  successMessage.value = null;
  showAddVisitModal.value = true;
};
 // Manejador de envío del formulario de nueva visita
const handleSubmit = async () => {
  errorMessage.value = null;
  successMessage.value = null;

  if (!newVisitForm.value.patientNationalId || !newVisitForm.value.practitionerNationalId || !newVisitForm.value.visitDate) {
    errorMessage.value = 'Por favor, complete todos los campos requeridos de la visita (Paciente, Profesional, Fecha de Visita).';
    return;
  }

  if (includeBloodPressure.value && newVisitForm.value.practitionerNationalId) {
    const selectedPractitioner = practitionerStore.practitioners.find(
      (p) => p.identifier?.[0]?.value === newVisitForm.value.practitionerNationalId
    );
    newVisitForm.value.bloodPressureMeasurement!.measuredBy = selectedPractitioner?.name?.[0]?.family || 'Desconocido';

    if (
      newVisitForm.value.bloodPressureMeasurement!.systolicMagnitude === null ||
      newVisitForm.value.bloodPressureMeasurement!.diastolicMagnitude === null ||
      !newVisitForm.value.bloodPressureMeasurement!.location ||
      !newVisitForm.value.bloodPressureMeasurement!.date
    ) {
      errorMessage.value = 'Por favor, complete todos los campos de la medición de presión arterial si está incluida.';
      return;
    }
    if (newVisitForm.value.bloodPressureMeasurement!.systolicMagnitude < 50 || newVisitForm.value.bloodPressureMeasurement!.systolicMagnitude > 300) {
      errorMessage.value = 'El valor sistólico debe estar entre 50 y 300 mm[Hg].';
      return;
    }
    if (newVisitForm.value.bloodPressureMeasurement!.diastolicMagnitude < 30 || newVisitForm.value.bloodPressureMeasurement!.diastolicMagnitude > 200) {
      errorMessage.value = 'El valor diastólico debe estar entre 30 y 200 mm[Hg].';
      return;
    }
  } else {
    newVisitForm.value.bloodPressureMeasurement = undefined;
  }

  try {
    const payload: VisitRequestFrontend = {
      patientNationalId: newVisitForm.value.patientNationalId,
      practitionerNationalId: newVisitForm.value.practitionerNationalId,
      visitDate: new Date(newVisitForm.value.visitDate + ':00').toISOString(),
    };

    if (newVisitForm.value.bloodPressureMeasurement) {
      payload.bloodPressureMeasurement = {
        ...newVisitForm.value.bloodPressureMeasurement,
        date: new Date(newVisitForm.value.bloodPressureMeasurement.date + ':00').toISOString(),
      };
    }

    const result = await visitStore.createVisitWithBloodPressure(payload);

    if (result) {
      successMessage.value = `Visita creada exitosamente con UUID: ${result.uuid}`;
      showAddVisitModal.value = false;
      if (filterPatientNationalId.value) {
        await visitStore.getVisitsByPatientNationalId(filterPatientNationalId.value);
      }
    } else {
      errorMessage.value = visitStore.error || 'No se pudo guardar la visita.';
    }
  } catch (error: any) {
    console.error('Error durante el envío de la visita:', error);
    errorMessage.value = error.message || 'Ocurrió un error inesperado.';
  }
};

// Filtrar visitas por paciente nacional ID
const filterVisitsByPatient = async () => {
  if (filterPatientNationalId.value) {
    await visitStore.getVisitsByPatientNationalId(filterPatientNationalId.value);
  } else {
    visitStore.visits = [];
    errorMessage.value = 'Por favor, seleccione un paciente para ver las visitas.';
  }
};

// Establecer el formato de fecha y hora
const formatDateTime = (dateTimeString: string) => {
  if (!dateTimeString) return 'N/A';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateTimeString).toLocaleDateString('es-ES', options);
};
</script>

<template>
  <!-- SubHeader con menu breadcrumbs-->
  <div class="container py-4">
    <h2>Calendario de Visitas</h2>
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/dashboard">Dashboard</router-link>
        </li>
        <li class="breadcrumb-item active">Visitas</li>
      </ol>
    </nav>

    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="form-group">
        <label for="filterPatient">Filtrar por DNI/NIE del Paciente</label>
        <select class="form-select" id="filterPatient" v-model="filterPatientNationalId" @change="filterVisitsByPatient">
          <option value="">Seleccionar Paciente</option>
          <option v-for="patient in patientStore.patients" :key="patient.id" :value="patient.identifier?.[0]?.value">
            {{ patient.identifier?.[0]?.value }} - {{ patient.name?.[0]?.given?.[0] }} {{ patient.name?.[0]?.family }}
          </option>
        </select>
        <small v-if="patientStore.patients.length === 0" class="text-danger">No hay pacientes disponibles.</small>
      </div>
      <button @click="openAddVisitModal" class="btn btn-primary">
        Añadir Nueva Visita
      </button>
    </div>

    <!-- Mensaje tipo Spinner de cargar visitas -->
    <div v-if="visitStore.loading" class="text-center p-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="text-muted mt-2">Cargando visitas...</p>
    </div>

    <div v-else-if="visitStore.error" class="alert alert-danger">
      Error: {{ visitStore.error }}
    </div>

    <div v-else>
      <div v-if="visitStore.visits.length === 0 && filterPatientNationalId" class="text-center p-5">
        <h5 class="text-muted">No hay visitas programadas para el paciente {{ filterPatientNationalId }}.</h5>
        <button @click="openAddVisitModal" class="btn btn-primary mt-3">
          Programar Primera Visita
        </button>
      </div>
      <div v-else-if="visitStore.visits.length === 0 && !filterPatientNationalId" class="text-center p-5">
        <h5 class="text-muted">Por favor, seleccione un paciente para ver las visitas. programadas</h5>
      </div>

      <div v-else class="list-group">
        <div v-for="visit in visitStore.visits" :key="visit.uuid" class="list-group-item mb-3 shadow-sm rounded">
          <div class="d-flex w-100 justify-content-between align-items-center">
            <h5 class="mb-1">Visita (UUID: {{ visit.uuid.substring(0, 8) }}...) - {{ formatDateTime(visit.date.toISOString()) }}</h5>
            <div>
              <span class="badge bg-info text-dark me-2">
                Dr. {{ visit.practitionerName }}
              </span>
              <span v-if="visit.bloodPressureCompositionId" class="badge bg-success">
                Datos EHRbase composicionID
              </span>
              <span v-else class="badge bg-warning text-dark">
                Sin Medición de presión
              </span>
            </div>
          </div>
          <!-- Aunque es poco amigable mostrar datos de EHRbase de momento ayuda a ver que se cargan bien-->
          <p class="mb-1">DNI/NIE del Paciente: <strong>{{ visit.patientNationalId }}</strong></p>
          <small class="text-muted">DNI/NIE del Profesional: {{ visit.practitionerNationalId }}</small><br>
          <small v-if="visit.bloodPressureCompositionId" class="text-muted">ID de Composición: {{ visit.bloodPressureCompositionId.substring(0, 8) }}...</small>

          <div v-if="visit.bloodPressureMeasurement" class="alert alert-info mt-3 py-2">
            <strong>Medición de Presión Arterial:</strong><br>
            Sistólica: {{ visit.bloodPressureMeasurement.systolicMagnitude }} {{ visit.bloodPressureMeasurement.systolicUnit }}<br>
            Diastólica: {{ visit.bloodPressureMeasurement.diastolicMagnitude }} {{ visit.bloodPressureMeasurement.diastolicUnit }}<br>
            Ubicación: {{ visit.bloodPressureMeasurement.location }}<br>
            Medido por: {{ visit.bloodPressureMeasurement.measuredBy }}<br>
            Fecha: {{ formatDateTime(visit.bloodPressureMeasurement.date) }}
          </div>
          <div v-else-if="visit.bloodPressureCompositionId" class="alert alert-warning mt-3 py-2">
            Esta visita tiene una medición de presión arterial (ID: {{ visit.bloodPressureCompositionId.substring(0, 8) }}...), pero los datos no están disponibles. Verifique el ehrId o la composición.
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para añadir nueva visita-->
    <div v-if="showAddVisitModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0, 0, 0, 0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Añadir Nueva Visita y Medición</h5>
            <button type="button" class="btn-close" @click="showAddVisitModal = false"></button>
          </div>
          <div class="modal-body">
            <div v-if="errorMessage" class="alert alert-danger" role="alert">
              {{ errorMessage }}
            </div>
            <div v-if="successMessage" class="alert alert-success" role="alert">
              {{ successMessage }}
            </div>
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label for="patientNationalId" class="form-label">DNI/NIE del Paciente</label>
                <select class="form-select" id="patientNationalId" v-model="newVisitForm.patientNationalId" required>
                  <option value="">-- Seleccionar Paciente --</option>
                  <option v-for="patient in patientStore.patients" :key="patient.id" :value="patient.identifier?.[0]?.value">
                    {{ patient.identifier?.[0]?.value }} - {{ patient.name?.[0]?.given?.[0] }} {{ patient.name?.[0]?.family }}
                  </option>
                </select>
                <small v-if="patientStore.patients.length === 0" class="text-danger">No hay pacientes disponibles. Por favor, añada un paciente.</small>
              </div>
              <div class="mb-3">
                <label for="practitionerNationalId" class="form-label">DNI/NIE del Profesional</label>
                <select class="form-select" id="practitionerNationalId" v-model="newVisitForm.practitionerNationalId" required>
                  <option value="">-- Seleccionar Profesional --</option>
                  <option v-for="practitioner in practitionerStore.practitioners" :key="practitioner.id" :value="practitioner.identifier?.[0]?.value">
                    {{ practitioner.name?.[0]?.given?.[0] }} {{ practitioner.name?.[0]?.family }} - {{ practitioner.identifier?.[0]?.value }}
                  </option>
                </select>
                <small v-if="practitionerStore.practitioners.length === 0" class="text-danger">No hay profesionales disponibles. Por favor, añada un profesional.</small>
              </div>
              <div class="mb-3">
                <label for="visitDate" class="form-label">Fecha y Hora de la Visita</label>
                <input type="datetime-local" class="form-control" id="visitDate" v-model="newVisitForm.visitDate" required>
              </div>
              <!-- En caso de que la visita ya esté programa añadir medición, esto se deberia manejar de otra forma, separando citas
               de visitas -->
              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="includeBloodPressure" v-model="includeBloodPressure">
                <label class="form-check-label" for="includeBloodPressure">Incluir Medición de Presión Arterial</label>
              </div>
              <div v-if="includeBloodPressure">
                <hr>
                <h6>Detalles de la Medición de Presión Arterial</h6>
                <div class="mb-3">
                  <label for="bpSystolic" class="form-label">Sistólica (mm[Hg])</label>
                  <input type="number" class="form-control" id="bpSystolic" v-model.number="newVisitForm.bloodPressureMeasurement!.systolicMagnitude" required>
                </div>
                <div class="mb-3">
                  <label for="bpDiastolic" class="form-label">Diastólica (mm[Hg])</label>
                  <input type="number" class="form-control" id="bpDiastolic" v-model.number="newVisitForm.bloodPressureMeasurement!.diastolicMagnitude" required>
                </div>
                <div class="mb-3">
                  <label for="bpLocation" class="form-label">Ubicación</label>
                  <select class="form-select" id="bpLocation" v-model="newVisitForm.bloodPressureMeasurement!.location" required>
                    <option value="Right arm">Brazo Derecho</option>
                    <option value="Left arm">Brazo Izquierdo</option>
                    <option value="Other">Otro</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="bpMeasurementTime" class="form-label">Fecha y Hora de la Medición</label>
                  <input type="datetime-local" class="form-control" id="bpMeasurementTime" v-model="newVisitForm.bloodPressureMeasurement!.date" required>
                </div>
              </div>
              <button type="submit" class="btn btn-success" :disabled="visitStore.loading">
                {{ visitStore.loading ? 'Guardando...' : 'Guardar Visita' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.list-group-item {
  border-left: 5px solid #007bff;
}
.list-group-item:hover {
  background-color: #f8f9fa;
}
.text-danger {
  color: #dc3545;
}
</style>
