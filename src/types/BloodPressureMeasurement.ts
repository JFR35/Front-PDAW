/**
 * Representa una medición de presión sanguínea tal como la devuelve el backend.
 * Refleja el BloodPressureMeasurementDto.java
 */
export interface BloodPressureMeasurement {
  date: string; // O Date si prefieres convertirlo a objeto Date en el frontend
  systolicMagnitude: number;
  systolicUnit: string;
  diastolicMagnitude: number;
  diastolicUnit: string;
  location: string;
  measuredBy?: string; // Opcional, si se implementa en el backend
}
