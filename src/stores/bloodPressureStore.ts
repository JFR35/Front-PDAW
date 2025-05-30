// Estructura de datos para interfaz para la medición de presión arterial
export interface BloodPressureMeasurement {
  date?: string;
  systolicMagnitude?: number;
  systolicUnit: string;
  diastolicMagnitude?: number;
  diastolicUnit: string;
  location?: string;
  measuredBy?: string;
}

// Estructura de datos para la solicitud de visita
export interface VisitRequestFrontend {
  patientNationalId: string;
  practitionerNationalId: string;
  visitDate?: string;
  bloodPressureMeasurement?: BloodPressureMeasurement;
}

