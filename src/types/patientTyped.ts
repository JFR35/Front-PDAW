// src/types/PatientTyped.ts (o FhirPatient.ts)

/**
 * Define la estructura estándar de un identificador en FHIR.
 * Puedes mover esto a un archivo FhirCommon.ts si lo usas en varios lugares.
 */
export interface Identifier {
  system: string;
  value: string;
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';
}

/**
 * Define la estructura estándar de un nombre humano en FHIR.
 * Puedes mover esto a un archivo FhirCommon.ts si lo usas en varios lugares.
 */
export interface HumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  family: string; // Obligatorio si en tu SD lo es
  given: string[];
  prefix?: string[];
  suffix?: string[];
}

// Puedes añadir ContactPoint, Address, CodeableConcept, Coding aquí o en un archivo común
// si los usarás para Patient también.

/**
 * Representa un recurso de FHIR Patient.
 * Define la estructura estándar de un paciente
 * acorde al StructureDefinition.
 */
export interface FhirPatient {
  resourceType: 'Patient';
  id?: string;
  meta?: { // Añadido para consistencia y uso de perfiles
    profile?: string[];
  };
  identifier: Identifier[]; // Obligatorio según tu StructureDefinition (min: 1)
  name: HumanName[]; // Obligatorio según tu JSON de ejemplo
  gender: 'male' | 'female' | 'other' | 'unknown'; // Obligatorio según tu JSON de ejemplo
  birthDate: string; // Obligatorio según tu JSON de ejemplo
  // Eliminar 'text' a menos que tengas un caso de uso específico para generarlo en el frontend
  // telecom?: ContactPoint[]; // Añadir si tu perfil Patient lo usa
  // address?: Address[];     // Añadir si tu perfil Patient lo usa
  // Otros campos FHIR Patient relevantes de tu StructureDefinition...
}

/**
 * Entidad de persistencia del paciente en la BBDD
 * Define la estructura para almacenar un recurso FHIR
 *
 * Incluye su representación JSON y su versión interpretada.
 */
export interface FhirPatientEntity {
  id: string; // El ID de la BBDD local (UUID u otro)
  nationalId: string; // El identificador que usas en tu EMPI para el paciente (ej. DNI/NIE)
  fhirId?: string; // El ID que Aidbox (u otro FHIR server) asigna al recurso Patient
  name?: string; // Campo opcional si tu PMI almacena el nombre concatenado del paciente
  resourcePatientJson: string; // La representación JSON completa del recurso FHIR Patient
  parsedPatient?: FhirPatient; // La representación de objeto TypeScript del recurso FHIR Patient
  // Otros campos de tu PatientMasterIndex si los hay (ej. assignedPractitionerId)
}

// Para crear un nuevo paciente en el formulario
export const emptyPatient: FhirPatient = {
  resourceType: 'Patient',
  identifier: [{ system: '', value: '' }], // Inicializar system y value vacíos
  name: [{ given: [''], family: '' }], // Inicializar family vacía
  gender: 'unknown', // O el valor por defecto que prefieras
  birthDate: '',
};

