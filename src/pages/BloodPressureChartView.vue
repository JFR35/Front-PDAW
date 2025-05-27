<template>
  <div>
    <button @click="goBack" class="btn btn-outline-secondary mb-3">
      <i class="bi bi-arrow-left me-2"></i> Volver
    </button>

    <div class="chart-container">
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
  type ChartOptions
} from 'chart.js';
import { Line } from 'vue-chartjs';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

function goBack() {
  router.back(); // Navega a la vista anterior
}

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

// Datos mockeados
const mockMeasurements = [
  { date: '2024-05-20', systolic: 120, diastolic: 80 },
  { date: '2024-05-21', systolic: 118, diastolic: 82 },
  { date: '2024-05-22', systolic: 125, diastolic: 85 },
  { date: '2024-05-23', systolic: 130, diastolic: 88 },
  { date: '2024-05-24', systolic: 128, diastolic: 84 },
];

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
      }
    },
    title: {
      display: true,
      text: 'Evolución de la Presión Arterial',
      font: {
        size: 16
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return `${context.dataset.label}: ${context.raw} mmHg`;
        }
      }
    }
  },
  scales: {
    y: {
      title: {
        display: true,
        text: 'mmHg'
      },
      min: 70,
      max: 140
    }
  }
});

onMounted(() => {
  const labels = mockMeasurements.map(m =>
    new Date(m.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  );

  const systolic = mockMeasurements.map(m => m.systolic);
  const diastolic = mockMeasurements.map(m => m.diastolic);

  chartData.value = {
    labels,
    datasets: [
      {
        label: 'Presión Sistólica (mmHg)',
        backgroundColor: '#dc3545',
        borderColor: '#dc3545',
        data: systolic,
        fill: false,
        tension: 0.3,
      },
      {
        label: 'Presión Diastólica (mmHg)',
        backgroundColor: '#0d6efd',
        borderColor: '#0d6efd',
        data: diastolic,
        fill: false,
        tension: 0.3,
      },
    ],
  };
});
</script>

<style scoped>
.chart-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>
