// Configuración y vista para el gráfico de presión arterial

<template>
  <div>
    <button @click="goBack" class="btn btn-outline-secondary mb-3">
      <i class="bi bi-arrow-left me-2"></i> Volver
    </button>
    <h1 class="mb-4">Gráfico de Presión Arterial</h1>
    <div v-if="loading" class="text-center p-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Cargando datos de presión arterial...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      Error al cargar los datos: {{ error }}
    </div>

    <div v-else-if="chartData.labels.length === 0" class="alert alert-info">
      No hay datos de presión arterial registrados.
    </div>

    <div v-else class="chart-container">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  type ChartOptions,
} from 'chart.js';
import { Line } from 'vue-chartjs';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useVisitStore } from '@/stores/visitStore';

// Define the BloodPressureMeasurement type
type BloodPressureMeasurement = {
  date: string;
  systolicMagnitude: number;
  diastolicMagnitude: number;
};

// Define the VisitWithBloodPressure type if not imported from elsewhere
type VisitWithBloodPressure = {
  bloodPressureMeasurement?: BloodPressureMeasurement;
  // Add other properties as needed
};

const router = useRouter();
const visitStore = useVisitStore();

const loading = ref(false);
const error = ref<string | null>(null);

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

// Datos del gráfico
const chartData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: 'Presión Sistólica (mmHg)',
      backgroundColor: '#dc3545',
      borderColor: '#dc3545',
      data: [] as number[],
      fill: false,
      tension: 0.3,
    },
    {
      label: 'Presión Diastólica (mmHg)',
      backgroundColor: '#0d6efd',
      borderColor: '#0d6efd',
      data: [] as number[],
      fill: false,
      tension: 0.3,
    },
  ],
});

const chartOptions = ref<ChartOptions<'line'>>({
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
      },
    },
    title: {
      display: true,
      text: 'Evolución de la Presión Arterial',
      font: {
        size: 16,
      },
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          return `${context.dataset.label}: ${context.raw} mmHg`;
        },
      },
    },
  },
  scales: {
    y: {
      title: {
        display: true,
        text: 'mmHg',
      },
      min: 50,
      suggestedMax: 200,
    },
    x: {
      title: {
        display: true,
        text: 'Fecha',
      },
    },
  },
});

onMounted(async () => {
  try {
    loading.value = true;
    error.value = null;

    // Verifica primero si hay visitas cargadas
    if (!visitStore.visits || visitStore.visits.length === 0) {
      console.warn('No hay visitas cargadas en el store');
      return;
    }

    // Extraer y filtrar mediciones válidas
    const measurements = visitStore.visits
      .filter((visit: VisitWithBloodPressure) => {
        const bp = visit.bloodPressureMeasurement;
        return bp &&
               bp.date &&
               typeof bp.systolicMagnitude === 'number' &&
               typeof bp.diastolicMagnitude === 'number';
      })
      .map((visit: VisitWithBloodPressure) => ({
        date: new Date(visit.bloodPressureMeasurement!.date),
        systolic: visit.bloodPressureMeasurement!.systolicMagnitude,
        diastolic: visit.bloodPressureMeasurement!.diastolicMagnitude,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    console.log('Mediciones filtradas:', measurements); // Debug

    if (measurements.length === 0) {
      console.warn('No hay mediciones de presión arterial válidas');
      return;
    }

    // Formatear etiquetas
    const labelOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };

    const labels = measurements.map(m =>
      m.date.toLocaleDateString('es-ES', labelOptions)
    );

    const systolic = measurements.map(m => m.systolic);
    const diastolic = measurements.map(m => m.diastolic);

    // Calcular rangos del eje Y
    const maxValue = Math.max(...systolic, ...diastolic);
    const minValue = Math.min(...systolic, ...diastolic);
    const padding = 20;

    // Actualizar datos del gráfico
    chartData.value = {
      labels,
      datasets: [
        {
          ...chartData.value.datasets[0],
          data: systolic,
        },
        {
          ...chartData.value.datasets[1],
          data: diastolic,
        },
      ],
    };

    // Actualizar opciones del gráfico
    chartOptions.value = {
      ...chartOptions.value,
      scales: {
        ...chartOptions.value.scales,
        y: {
          title: { display: true, text: 'mmHg' },
          min: Math.max(0, minValue - padding),
          max: maxValue + padding,
        },
      },
    };

  } catch (err) {
    console.error('Error al cargar datos:', err);
    error.value = 'Error al cargar los datos de presión arterial';
  } finally {
    loading.value = false;
  }
});

function goBack() {
  router.back();
}
</script>

<style scoped>
.chart-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
