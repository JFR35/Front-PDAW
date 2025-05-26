<!-- src/components/AppointmentView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useVisitStore } from '@/stores/visitStore';
import { useBloodPressureStore } from '@/stores/bloodPressureStore';
import { useEntityStore } from '@/stores/entityStore';
import type { Visit, BloodPressureRecordRequest } from '@/types/Visit';

const visitStore = useVisitStore();
const bloodPressureStore = useBloodPressureStore();
const entityStore = useEntityStore();

const patientNationalId = ref<string>('12345678D');
const patientLocalId = ref<number>(1);
const showAddVisitModal = ref(false);

const newVisitDate = ref('');
const newPractitionerId = ref<number | null>(1);
const newBpSystolic = ref<number | null>(null);
const newBpDiastolic = ref<number | null>(null);
const newBpLocation = ref('Right arm');
const newBpMeasurementTime = ref('');
const includeBloodPressure = ref(false);
const errorMessage = ref<string | null>(null);

onMounted(async () => {
  if (patientLocalId.value) {
    await visitStore.loadVisitsByPatient(patientLocalId.value);
  }
});

const openAddVisitModal = () => {
  const now = new Date().toISOString().slice(0, 16);
  newVisitDate.value = now;
  newBpMeasurementTime.value = now;
  newPractitionerId.value = 1;
  newBpSystolic.value = null;
  newBpDiastolic.value = null;
  includeBloodPressure.value = false;
  errorMessage.value = null;
  showAddVisitModal.value = true;
};

const addVisitAndMeasurement = async () => {
  errorMessage.value = null;
  if (!patientLocalId.value || !newPractitionerId.value || !newVisitDate.value) {
    errorMessage.value = 'Please complete all visit fields.';
    return;
  }
  if (includeBloodPressure.value) {
    if (!newBpSystolic.value || !newBpDiastolic.value || !newBpLocation.value || !newBpMeasurementTime.value) {
      errorMessage.value = 'Please complete all blood pressure fields.';
      return;
    }
    if (newBpSystolic.value < 50 || newBpSystolic.value > 300) {
      errorMessage.value = 'Systolic value must be between 50 and 300 mm[Hg].';
      return;
    }
    if (newBpDiastolic.value < 30 || newBpDiastolic.value > 200) {
      errorMessage.value = 'Diastolic value must be between 30 and 200 mm[Hg].';
      return;
    }
  }
  try {
    if (includeBloodPressure.value) {
      const measurementDate = new Date(newBpMeasurementTime.value + ':00').toISOString();
      const bpData: BloodPressureRecordRequest = {
        date: measurementDate,
        systolicMagnitude: newBpSystolic.value!,
        systolicUnit: 'mm[Hg]',
        diastolicMagnitude: newBpDiastolic.value!,
        diastolicUnit: 'mm[Hg]',
        location: newBpLocation.value,
        measuredBy: entityStore.practitioners.find(p => p.id === newPractitionerId.value)?.name || 'Unknown',
        practitionerId: newPractitionerId.value,
      };
      const response = await bloodPressureStore.addBloodPressureMeasurement(patientNationalId.value, bpData);
      await visitStore.loadVisitDetails(response.visitLocalId);
    } else {
      const visitDate = new Date(newVisitDate.value + ':00').toISOString();
      await visitStore.addVisit(patientLocalId.value, newPractitionerId.value, visitDate);
      await visitStore.loadVisitsByPatient(patientLocalId.value);
    }
    showAddVisitModal.value = false;
    alert('Visit and measurement saved successfully.');
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to save. Please check patient and practitioner details.';
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

    <div class="d-flex justify-content-end mb-4">
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
      <div v-if="visitStore.visits.length === 0" class="text-center p-5">
        <h5 class="text-muted">No visits registered for this patient.</h5>
        <button @click="openAddVisitModal" class="btn btn-primary mt-3">
          Schedule First Visit
        </button>
      </div>

      <div v-else class="list-group">
        <div v-for="visit in visitStore.sortedVisits" :key="visit.id" class="list-group-item mb-3 shadow-sm rounded">
          <div class="d-flex w-100 justify-content-between align-items-center">
            <h5 class="mb-1">Visit #{{ visit.visitId.substring(0, 8) }} - {{ formatDateTime(visit.visitDate) }}</h5>
            <div>
              <span class="badge bg-info text-dark me-2">
                Dr. {{ visit.practitioner.name }}
              </span>
              <span v-if="visit.compositionId" class="badge bg-success">
                EHRbase Data
              </span>
              <span v-else class="badge bg-warning text-dark">
                Pending EHRbase
              </span>
              <button @click="() => { visitStore.loadVisitDetails(visit.id); }" class="btn btn-sm btn-outline-primary ms-2">
                View Details
              </button>
            </div>
          </div>
          <p class="mb-1">Patient: <strong>{{ visit.patient.nationalId }}</strong></p>
          <small class="text-muted">Local ID: {{ visit.id }}</small><br>
          <small v-if="visit.compositionId" class="text-muted">Composition ID: {{ visit.compositionId.substring(0, 8) }}...</small>

          <div v-if="visitStore.selectedVisit && visitStore.selectedVisit.visit.id === visit.id && visitStore.selectedVisit.measurement" class="mt-3">
            <h6>Blood Pressure Measurement:</h6>
            <ul class="list-group list-group-flush">
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  <strong>{{ visitStore.selectedVisit.measurement.systolicMagnitude }} {{ visitStore.selectedVisit.measurement.systolicUnit }} / {{ visitStore.selectedVisit.measurement.diastolicMagnitude }} {{ visitStore.selectedVisit.measurement.diastolicUnit }}</strong>
                  <small class="text-muted ms-2">({{ formatDateTime(visitStore.selectedVisit.measurement.date) }} - {{ visitStore.selectedVisit.measurement.location }})</small>
                </span>
                <span v-if="visitStore.selectedVisit.measurement.measuredBy" class="badge bg-secondary">
                  Measured by: {{ visitStore.selectedVisit.measurement.measuredBy }}
                </span>
              </li>
            </ul>
          </div>
          <div v-else-if="visitStore.selectedVisit && visitStore.selectedVisit.visit.id === visit.id" class="alert alert-info mt-3 py-2">
            No blood pressure measurements for this visit.
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
            <form @submit.prevent="addVisitAndMeasurement">
              <div class="mb-3">
                <label for="patientId" class="form-label">Patient</label>
                <select class="form-select" id="patientId" v-model="patientLocalId" @change="patientNationalId = entityStore.patients.find(p => p.id === patientLocalId)?.nationalId || ''" required>
                  <option v-for="patient in entityStore.patients" :key="patient.id" :value="patient.id">
                    {{ patient.nationalId }}
                  </option>
                </select>
                <small v-if="entityStore.patients.length === 0" class="text-danger">No patients available. Please add a patient.</small>
              </div>
              <div class="mb-3">
                <label for="practitionerId" class="form-label">Practitioner</label>
                <select class="form-select" id="practitionerId" v-model="newPractitionerId" required>
                  <option v-for="practitioner in entityStore.practitioners" :key="practitioner.id" :value="practitioner.id">
                    {{ practitioner.name }}
                  </option>
                </select>
                <small v-if="entityStore.practitioners.length === 0" class="text-danger">No practitioners available. Please add a practitioner.</small>
              </div>
              <div class="mb-3">
                <label for="visitDate" class="form-label">Visit Date and Time</label>
                <input type="datetime-local" class="form-control" id="visitDate" v-model="newVisitDate" required>
              </div>
              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="includeBloodPressure" v-model="includeBloodPressure">
                <label class="form-check-label" for="includeBloodPressure">Include Blood Pressure Measurement</label>
              </div>
              <div v-if="includeBloodPressure">
                <div class="mb-3">
                  <label for="bpSystolic" class="form-label">Systolic (mm[Hg])</label>
                  <input type="number" class="form-control" id="bpSystolic" v-model.number="newBpSystolic" required>
                </div>
                <div class="mb-3">
                  <label for="bpDiastolic" class="form-label">Diastolic (mm[Hg])</label>
                  <input type="number" class="form-control" id="bpDiastolic" v-model.number="newBpDiastolic" required>
                </div>
                <div class="mb-3">
                  <label for="bpLocation" class="form-label">Location</label>
                  <select class="form-select" id="bpLocation" v-model="newBpLocation" required>
                    <option value="Right arm">Right Arm</option>
                    <option value="Left arm">Left Arm</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="bpMeasurementTime" class="form-label">Measurement Date and Time</label>
                  <input type="datetime-local" class="form-control" id="bpMeasurementTime" v-model="newBpMeasurementTime" required>
                </div>
              </div>
              <button type="submit" class="btn btn-success">Save Visit and Measurement</button>
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
