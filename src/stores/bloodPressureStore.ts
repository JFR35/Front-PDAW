// src/types/VisitTyped.ts (Ensure these interfaces are correct)

export interface BloodPressureMeasurement {
  date?: string; // ISO 8601 string, e.g., "2025-05-27T10:00:00Z"
  systolicMagnitude?: number;
  systolicUnit: string; // "mm[Hg]"
  diastolicMagnitude?: number;
  diastolicUnit: string; // "mm[Hg]"
  location?: string;
  measuredBy?: string; // Name of the practitioner or who took the measurement
}

export interface VisitRequestFrontend {
  patientNationalId: string;
  practitionerNationalId: string;
  visitDate?: string; // Optional, ISO 8601 format
  bloodPressureMeasurement?: BloodPressureMeasurement; // Optional, if the visit includes a measurement
}

// ... other VisitResponseBackend, Visit interfaces as defined previously
