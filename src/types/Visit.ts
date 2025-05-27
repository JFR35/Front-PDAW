// src/types/VisitTyped.ts

// Reutiliza o define las interfaces para BloodPressureMeasurement si no están ya en otro lugar
// (Si ya la tienes en PatientTyped.ts, puedes importarla o dejarla aquí si es más específica de visitas)
export interface BloodPressureMeasurement {
  date: string; // ISO 8601 string, e.g., "2025-05-27T10:00:00Z"
  systolicMagnitude: number;
  systolicUnit: string; // "mm[Hg]"
  diastolicMagnitude: number;
  diastolicUnit: string; // "mm[Hg]"
  location: string;
  measuredBy: string; // Nombre del profesional o quien tomó la medida
  // practitionerId: number; // Ya no necesario aquí si se envía a nivel de VisitRequestFrontend
}

/**
 * Representa la solicitud de creación de una visita desde el frontend.
 * Corresponde a VisitRequestDTO en el backend de Java.
 */
export interface VisitRequestFrontend {
  patientNationalId: string;
  practitionerNationalId: string;
  visitDate?: string; // Opcional, formato ISO 8601
  bloodPressureMeasurement?: BloodPressureMeasurement; // Opcional, si la visita incluye una medición
}

/**
 * Representa la respuesta de una visita desde el backend.
 * Corresponde a VisitResponseDTO en el backend de Java.
 */
export interface VisitResponseBackend {
  visitUuid: string;
  patientNationalId: string;
  practitionerNationalId: string;
  practitionerName: string;
  visitDate: string; // ISO 8601 string
  bloodPressureCompositionId?: string; // Opcional, si se registró una medición de presión
}

// Puedes añadir una interfaz para tu estado interno de la visita si necesitas manipularla
// de forma diferente a como viene del backend, pero a menudo VisitResponseBackend es suficiente.
export interface Visit {
  uuid: string;
  patientNationalId: string;
  practitionerNationalId: string;
  practitionerName: string;
  date: Date; // Convertiremos la string a objeto Date para uso en UI
  bloodPressureCompositionId?: string;
  // Podrías anidar aquí también el objeto de la medición si lo recuperas
  // bloodPressureMeasurement?: BloodPressureMeasurement;
}
