typescript

Copiar
// src/components/AppointmentView.vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useVisitStore } from '@/stores/visitStore';
import { usePatientStore } from '@/stores/patientStore';
import { usePractitionerStore } from '@/stores/practitionerStore';
import type { VisitRequestFrontend } from '@/types/VisitTyped';

const visitStore = useVisitStore();
const patientStore = usePatientStore();
const practitionerStore = usePractitionerStore();

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

onMounted(async () => {
  try {
    // Load patients and practitioners concurrently
    await Promise.all([
      patientStore.loadPatients(),
      practitionerStore.loadPractitioners(),
    ]);

    // Check if patients are available and have valid nationalId
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

    // Set default practitioner if available
    if (practitionerStore.practitioners.length > 0) {
      newVisitForm.value.practitionerNationalId = practitionerStore.practitioners[0].identifier[0].value;
    }
  } catch (error) {
    console.error('Error during component mount:', error);
    errorMessage.value = 'Failed to load patients or practitioners.';
  }
});

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

const handleSubmit = async () => {
  errorMessage.value = null;
  successMessage.value = null;

  if (!newVisitForm.value.patientNationalId || !newVisitForm.value.practitionerNationalId || !newVisitForm.value.visitDate) {
    errorMessage.value = 'Please complete all required visit fields (Patient, Practitioner, Visit Date).';
    return;
  }

  if (includeBloodPressure.value && newVisitForm.value.practitionerNationalId) {
    const selectedPractitioner = practitionerStore.practitioners.find(
      (p) => p.identifier?.[0]?.value === newVisitForm.value.practitionerNationalId
    );
    newVisitForm.value.bloodPressureMeasurement!.measuredBy = selectedPractitioner?.name?.[0]?.family || 'Unknown';

    if (
      newVisitForm.value.bloodPressureMeasurement!.systolicMagnitude === null ||
      newVisitForm.value.bloodPressureMeasurement!.diastolicMagnitude === null ||
      !newVisitForm.value.bloodPressureMeasurement!.location ||
      !newVisitForm.value.bloodPressureMeasurement!.date
    ) {
      errorMessage.value = 'Please complete all blood pressure fields if included.';
      return;
    }
    if (newVisitForm.value.bloodPressureMeasurement!.systolicMagnitude < 50 || newVisitForm.value.bloodPressureMeasurement!.systolicMagnitude > 300) {
      errorMessage.value = 'Systolic value must be between 50 and 300 mm[Hg].';
      return;
    }
    if (newVisitForm.value.bloodPressureMeasurement!.diastolicMagnitude < 30 || newVisitForm.value.bloodPressureMeasurement!.diastolicMagnitude > 200) {
      errorMessage.value = 'Diastolic value must be between 30 and 200 mm[Hg].';
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
      errorMessage.value = visitStore.error || 'Failed to save visit.';
    }
  } catch (error: any) {
    console.error('Error during visit submission:', error);
    errorMessage.value = error.message || 'An unexpected error occurred.';
  }
};

const filterVisitsByPatient = async () => {
  if (filterPatientNationalId.value) {
    await visitStore.getVisitsByPatientNationalId(filterPatientNationalId.value);
  } else {
    visitStore.visits = [];
    errorMessage.value = 'Please select a patient to view visits.';
  }
};

const formatDateTime = (dateTimeString: string) => {
  if (!dateTimeString) return 'N/A';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateTimeString).toLocaleDateString('es-ES', options);
};
</script>

<template>
  <div class="container py-4">
    <h2>Visit Calendar</h2>
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/dashboard">Dashboard</router-link>
        </li>
        <li class="breadcrumb-item active">Visits</li>
      </ol>
    </nav>

    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="form-group">
        <label for="filterPatient">Filter by Patient DNI/NIE:</label>
        <select class="form-select" id="filterPatient" v-model="filterPatientNationalId" @change="filterVisitsByPatient">
          <option value="">-- Select Patient --</option>
          <option v-for="patient in patientStore.patients" :key="patient.id" :value="patient.identifier?.[0]?.value">
            {{ patient.identifier?.[0]?.value }} - {{ patient.name?.[0]?.given?.[0] }} {{ patient.name?.[0]?.family }}
          </option>
        </select>
        <small v-if="patientStore.patients.length === 0" class="text-danger">No patients available.</small>
      </div>
      <button @click="openAddVisitModal" class="btn btn-primary">
        Add New Visit
      </button>
    </div>

    <div v-if="visitStore.loading" class="text-center p-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted mt-2">Loading visits...</p>
    </div>

    <div v-else-if="visitStore.error" class="alert alert-danger">
      Error: {{ visitStore.error }}
    </div>

    <div v-else>
      <div v-if="visitStore.visits.length === 0 && filterPatientNationalId" class="text-center p-5">
        <h5 class="text-muted">No visits registered for patient {{ filterPatientNationalId }}.</h5>
        <button @click="openAddVisitModal" class="btn btn-primary mt-3">
          Schedule First Visit
        </button>
      </div>
      <div v-else-if="visitStore.visits.length === 0 && !filterPatientNationalId" class="text-center p-5">
        <h5 class="text-muted">Please select a patient to view visits.</h5>
      </div>

      <div v-else class="list-group">
        <div v-for="visit in visitStore.visits" :key="visit.uuid" class="list-group-item mb-3 shadow-sm rounded">
          <div class="d-flex w-100 justify-content-between align-items-center">
            <h5 class="mb-1">Visit (UUID: {{ visit.uuid.substring(0, 8) }}...) - {{ formatDateTime(visit.date.toISOString()) }}</h5>
            <div>
              <span class="badge bg-info text-dark me-2">
                Dr. {{ visit.practitionerName }}
              </span>
              <span v-if="visit.bloodPressureCompositionId" class="badge bg-success">
                EHRbase Data
              </span>
              <span v-else class="badge bg-warning text-dark">
                No BP Measurement
              </span>
            </div>
          </div>
          <p class="mb-1">Patient DNI/NIE: <strong>{{ visit.patientNationalId }}</strong></p>
          <small class="text-muted">Practitioner DNI/NIE: {{ visit.practitionerNationalId }}</small><br>
          <small v-if="visit.bloodPressureCompositionId" class="text-muted">Composition ID: {{ visit.bloodPressureCompositionId.substring(0, 8) }}...</small>

          <div v-if="visit.bloodPressureCompositionId" class="alert alert-info mt-3 py-2">
            This visit includes a blood pressure measurement. Details stored in EHRbase (Composition ID: {{ visit.bloodPressureCompositionId.substring(0, 8) }}...).
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAddVisitModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0, 0, 0, 0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add New Visit and Measurement</h5>
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
                <label for="patientNationalId" class="form-label">Patient DNI/NIE</label>
                <select class="form-select" id="patientNationalId" v-model="newVisitForm.patientNationalId" required>
                  <option value="">-- Select Patient --</option>
                  <option v-for="patient in patientStore.patients" :key="patient.id" :value="patient.identifier?.[0]?.value">
                    {{ patient.identifier?.[0]?.value }} - {{ patient.name?.[0]?.given?.[0] }} {{ patient.name?.[0]?.family }}
                  </option>
                </select>
                <small v-if="patientStore.patients.length === 0" class="text-danger">No patients available. Please add a patient.</small>
              </div>
              <div class="mb-3">
                <label for="practitionerNationalId" class="form-label">Practitioner DNI/NIE</label>
                <select class="form-select" id="practitionerNationalId" v-model="newVisitForm.practitionerNationalId" required>
                  <option value="">-- Select Practitioner --</option>
                  <option v-for="practitioner in practitionerStore.practitioners" :key="practitioner.id" :value="practitioner.identifier?.[0]?.value">
                    {{ practitioner.name?.[0]?.given?.[0] }} {{ practitioner.name?.[0]?.family }} - {{ practitioner.identifier?.[0]?.value }}
                  </option>
                </select>
                <small v-if="practitionerStore.practitioners.length === 0" class="text-danger">No practitioners available. Please add a practitioner.</small>
              </div>
              <div class="mb-3">
                <label for="visitDate" class="form-label">Visit Date and Time</label>
                <input type="datetime-local" class="form-control" id="visitDate" v-model="newVisitForm.visitDate" required>
              </div>
              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="includeBloodPressure" v-model="includeBloodPressure">
                <label class="form-check-label" for="includeBloodPressure">Include Blood Pressure Measurement</label>
              </div>
              <div v-if="includeBloodPressure">
                <hr>
                <h6>Blood Pressure Details</h6>
                <div class="mb-3">
                  <label for="bpSystolic" class="form-label">Systolic (mm[Hg])</label>
                  <input type="number" class="form-control" id="bpSystolic" v-model.number="newVisitForm.bloodPressureMeasurement!.systolicMagnitude" required>
                </div>
                <div class="mb-3">
                  <label for="bpDiastolic" class="form-label">Diastolic (mm[Hg])</label>
                  <input type="number" class="form-control" id="bpDiastolic" v-model.number="newVisitForm.bloodPressureMeasurement!.diastolicMagnitude" required>
                </div>
                <div class="mb-3">
                  <label for="bpLocation" class="form-label">Location</label>
                  <select class="form-select" id="bpLocation" v-model="newVisitForm.bloodPressureMeasurement!.location" required>
                    <option value="Right arm">Right Arm</option>
                    <option value="Left arm">Left Arm</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="bpMeasurementTime" class="form-label">Measurement Date and Time</label>
                  <input type="datetime-local" class="form-control" id="bpMeasurementTime" v-model="newVisitForm.bloodPressureMeasurement!.date" required>
                </div>
              </div>
              <button type="submit" class="btn btn-success" :disabled="visitStore.loading">
                {{ visitStore.loading ? 'Saving...' : 'Save Visit' }}
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
