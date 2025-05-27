// src/types/PractitionerTyped.ts

/**
 * Define la estructura estándar de un identificador en FHIR (reutilizable).
 */
export interface Identifier {
  system: string;
  value: string;
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';
}

/**
 * Define la estructura estándar de un nombre humano en FHIR (reutilizable).
 */
export interface HumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  family: string;
  given: string[];
  prefix?: string[];
  suffix?: string[];
}

/**
 * Define la estructura estándar de una cualificación de Practitioner en FHIR.
 */
export interface PractitionerQualification {
  id?: string;
  code?: {
    coding?: {
      system?: string;
      code?: string;
      display?: string;
    }[];
    text?: string;
  };
  // Puedes añadir más campos de cualificación si tu SD los usa
}

/**
 * Representa un recurso de FHIR Practitioner.
 * Define la estructura estándar de un profesional de la salud.
 */
export interface FhirPractitioner {
  resourceType: 'Practitioner';
  id?: string;
  meta?: {
    profile?: string[];
  };
  identifier?: Identifier[]; // Puede ser opcional dependiendo de tu SD
  name?: HumanName[]; // Puede ser opcional
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  qualification?: PractitionerQualification[]; // Para la especialidad
  // Añade otros campos relevantes de FHIR Practitioner si los usas (telecom, address, etc.)
}

/**
 * Representa la respuesta de un profesional desde el backend (PractitionerResponseDTO de Java).
 * Contiene tanto los metadatos del EMPI como la cadena JSON del recurso FHIR Practitioner.
 */
export interface PractitionerResponseBackend {
  id: string; // ID interno del EMPI (Long en Java, pero puede ser string en TS si es UUID o si se convierte)
  nationalId: string; // DNI/NIE
  fhirId: string; // ID de Aidbox
  name: string; // Nombre del profesional (del PMI)
  specialty: string; // Especialidad (del PMI)
  fhirPractitionerJson: string; // <--- La cadena JSON del recurso FHIR Practitioner
  // Puedes añadir createdAt, updatedAt si los necesitas en el frontend
  createdAt?: string;
  updatedAt?: string;
}

// Para crear un nuevo profesional en el formulario (si no usas el FHIR JSON directamente)
export const emptyPractitioner: FhirPractitioner = {
  resourceType: 'Practitioner',
  identifier: [{ system: '', value: '' }],
  name: [{ given: [''], family: '' }],
  gender: 'unknown',
  birthDate: '',
  qualification: [{ code: { coding: [{ system: '', code: '', display: '' }] } }],
};// src/types/PractitionerTyped.ts

/**
 * Define la estructura estándar de un identificador en FHIR (reutilizable).
 */
export interface Identifier {
  system: string;
  value: string;
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';
}

/**
 * Define la estructura estándar de un nombre humano en FHIR (reutilizable).
 */
export interface HumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  family: string;
  given: string[];
  prefix?: string[];
  suffix?: string[];
}

/**
 * Define la estructura estándar de una cualificación de Practitioner en FHIR.
 */
export interface PractitionerQualification {
  id?: string;
  code?: {
    coding?: {
      system?: string;
      code?: string;
      display?: string;
    }[];
    text?: string;
  };
  // Puedes añadir más campos de cualificación si tu SD los usa
}

/**
 * Representa un recurso de FHIR Practitioner.
 * Define la estructura estándar de un profesional de la salud.
 */
export interface FhirPractitioner {
  resourceType: 'Practitioner';
  id?: string;
  meta?: {
    profile?: string[];
  };
  identifier?: Identifier[]; // Puede ser opcional dependiendo de tu SD
  name?: HumanName[]; // Puede ser opcional
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  qualification?: PractitionerQualification[]; // Para la especialidad
  // Añade otros campos relevantes de FHIR Practitioner si los usas (telecom, address, etc.)
}

/**
 * Representa la respuesta de un profesional desde el backend (PractitionerResponseDTO de Java).
 * Contiene tanto los metadatos del EMPI como la cadena JSON del recurso FHIR Practitioner.
 */
export interface PractitionerResponseBackend {
  id: string; // ID interno del EMPI (Long en Java, pero puede ser string en TS si es UUID o si se convierte)
  nationalId: string; // DNI/NIE
  fhirId: string; // ID de Aidbox
  name: string; // Nombre del profesional (del PMI)
  specialty: string; // Especialidad (del PMI)
  fhirPractitionerJson: string; // <--- La cadena JSON del recurso FHIR Practitioner
  // Puedes añadir createdAt, updatedAt si los necesitas en el frontend
  createdAt?: string;
  updatedAt?: string;
}

// Para crear un nuevo profesional en el formulario (si no usas el FHIR JSON directamente)
export const emptyPractitioner: FhirPractitioner = {
  resourceType: 'Practitioner',
  identifier: [{ system: '', value: '' }],
  name: [{ given: [''], family: '' }],
  gender: 'unknown',
  birthDate: '',
  qualification: [{ code: { coding: [{ system: '', code: '', display: '' }] } }],
};
