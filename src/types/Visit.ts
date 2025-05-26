// src/types/Visit.ts (unchanged)
export interface Visit {
  id: number;
  visitId: string;
  patient: {
    id: number;
    nationalId: string;
    ehrId?: string;
    fhirId?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  practitioner: {
    id: number;
    name: string;
    nationalId?: string;
    fhirId?: string;
    specialty?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  visitDate: string;
  compositionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BloodPressureMeasurement {
  date: string;
  systolicMagnitude: number;
  systolicUnit: string;
  diastolicMagnitude: number;
  diastolicUnit: string;
  location: string;
  measuredBy?: string;
  compositionId?: string;
}

export interface BloodPressureRecordRequest {
  date: string;
  systolicMagnitude: number;
  systolicUnit: string;
  diastolicMagnitude: number;
  diastolicUnit: string;
  location: string;
  measuredBy?: string;
  practitionerId: number;
}

export interface VisitWithMeasurement {
  visit: Visit;
  measurement?: BloodPressureMeasurement;
}
