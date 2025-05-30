/**
 * Representa una medición de presión sanguínea tal como la devuelve el backend.
 * Refleja el BloodPressureMeasurementDto.java
 */
export interface BloodPressureMeasurement {
  date: string; // Habría que cambiarlo a Date las fechas están dando problemas.
  systolicMagnitude: number;
  systolicUnit: string;
  diastolicMagnitude: number;
  diastolicUnit: string;
  location: string;
  measuredBy?: string;
}
export interface BloodPressureRecordRequest {
  visitLocalId: number;
  patientLocalId: number;
  practitionerLocalId: number;
  location: string;
  measurementTime: string; // Puesto en String daba problemas con el backend
  systolic: number;
  diastolic: number;
  meanArterialPressure?: number;
}
