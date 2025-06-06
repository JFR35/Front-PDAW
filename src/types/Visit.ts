// Interfaz para la solicitud de medición de presión sanguínea de visita
export interface BloodPressureMeasurement {
  date: string; // En formato ISO 8601
  systolicMagnitude: number;
  systolicUnit: string;
  diastolicMagnitude: number;
  diastolicUnit: string;
  location: string;
  measuredBy: string;
}

// Interfaz para la solicitud de visita al backend
export interface VisitRequestFrontend {
  patientNationalId: string;
  practitionerNationalId: string;
  visitDate?: string;
  bloodPressureMeasurement?: BloodPressureMeasurement;
}

// Interfaz para la respuesta de visita desde el backend
export interface VisitResponseBackend {
  visitUuid: string;
  patientNationalId: string;
  practitionerNationalId: string;
  practitionerName: string;
  visitDate: string;
  bloodPressureCompositionId?: string;
  ehrId?: string; // Añadido para incluir el ehrId si está disponible
}

// Interfaz para la respuesta en formato FLAT que es como JSON desde el endpoint /blood-pressure
export interface BloodPressureFlatResponse {
  'blood_pressure/category|code': string;
  'blood_pressure/category|value': string;
  'blood_pressure/category|terminology': string;
  'blood_pressure/context/start_time': string;
  'blood_pressure/context/setting|value': string;
  'blood_pressure/context/setting|code': string;
  'blood_pressure/context/setting|terminology': string;
  'blood_pressure/blood_pressure/any_event:0/systolic|unit': string;
  'blood_pressure/blood_pressure/any_event:0/systolic|magnitude': number;
  'blood_pressure/blood_pressure/any_event:0/diastolic|magnitude': number;
  'blood_pressure/blood_pressure/any_event:0/diastolic|unit': string;
  'blood_pressure/blood_pressure/any_event:0/time': string;
  'blood_pressure/blood_pressure/location_of_measurement|value': string;
  'blood_pressure/blood_pressure/method|value': string;
  'blood_pressure/composer|name': string;
  'blood_pressure/_uid': string;
}

export interface Visit {
  uuid: string;
  patientNationalId: string;
  practitionerNationalId: string;
  practitionerName: string;
  date: Date;
  bloodPressureCompositionId?: string;
  bloodPressureMeasurement?: BloodPressureMeasurement;
  ehrId?: string; // Añadido para almacenar el ehrId
}
