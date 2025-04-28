/**
 * Representa un recurso de FHIR practitioner.
 * Define la estructura estándar de un profesional
 * de la salud en FHIR R4.
 */

export interface FhirPractitioner {
  resourceType: 'Practitioner';
  id?: string;
  meta?: {
    profile?: string[];
  };
  identifier?: {
    system: string;
    value: string;
  }[];
  name: {
    family: string;
    given: string[];
  }[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  qualification?: {
    code: {
      coding: {
        system: string;
        code: string;
        display: string;
      }[];
    };
  }[];
  telecom?: {
    system: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
    value: string;
    use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  }[];
  address?: {
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }[];
}

/**
 * Entidad de persistencia del practitioner en la BBDD
 * Define la estructura para almacenar un recurso FHIR
 * en la bbdd.
 * Incluye su representación JSON y su versión interpretada.
 */
export interface FhirPractitionerEntity {
  id: string;
  resourcePractitionerJson: string;
  parsedPractitioner?: FhirPractitioner;
}
