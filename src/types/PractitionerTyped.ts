/**
 * Representa un recurso de FHIR practitioner.
 * Define la estructura estándar de un profesional
 * acorde al StructureDefinition.
 */

export interface FhirPractitioner {
    resourceType: 'Practitioner';
    id?: string;
    meta?: {
        profile?: string[];
    };
    name: {
        use?: 'official' | 'usual' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden'; // 'official' es el que usas
        family: string;
        given: string[];
    }[];
    gender: 'male' | 'female' | 'other' | 'unknown';
    birthDate: string;
    identifier: { // Será el DNI no usaremos número de licencia profesional
        system: string;
        value: string;
    }[];
    qualification: {
        code: {
            coding: {
                system: string;
                code: string;
                display: string;
            }[];
        };
    }[];
}

/**
 * Entidad de persistencia del practitioner en la BBDD
 * Define la estructura para almacenar un recurso FHIR
 *
 * Incluye su representación JSON y su versión interpretada.
 */
export interface FhirPractitionerEntity {
  readonly id: string;
  readonly resourcePractitionerJson: string;
  readonly parsedPractitioner?: FhirPractitioner;
}
