/**
 * Define el identificador estándar de FHIR.
 */
export interface Identifier {
  system: string
  value: string
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old' // Es ocpional, se deja para una futura ampliación del StructureDefinition
}

/**
 * Define el nombre humano en el formato estándar de FHIR.
 */
export interface HumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden' // Es opcional, se deja para una futura ampliación del StructureDefinition
  family: string
  given: string[]
}

/**
 * Representa un recurso de FHIR Patient.
 * Define la estructura estándar de un paciente acorde al StructureDefinition.
 */
export interface FhirPatient {
  resourceType: 'Patient'
  id?: string
  meta?: {
    profile?: string[]
  }
  identifier: Identifier[]
  name: HumanName[]
  gender: 'male' | 'female' | 'other' | 'unknown'
  birthDate: string
}

/**
 * Interface para representar un paciente en el PatientMasterIndex de nuestro EMPI
 */
export interface FhirPatientEntity {
  id: string // Es el ID lógico del paciente en nuestra bbdd local, no el FHIR ID, no confundir
  nationalId: string // El identificador nacional, único y obligatoria, sería aconsejable también el numero de licencia profesional
  fhirId?: string // ID lógico que el servidor FHIR asigna a cada paciente.
  name?: string
  fhirPatient: string // La representación JSON completa del recurso FHIR Patient
  parsedPatient?: FhirPatient // La representación de objeto TypeScript del recurso FHIR Patient
  ehrId?: string // El ID para la composición del paciente en el EHR
  assignedPractitioner?: string | null // De momento no se aplica relación al médico asignado al crear paciente
  createdAt?: string
  updatedAt?: string
}

// Objeto vacío para inicializar un paciente
export const emptyPatient: FhirPatient = {
  resourceType: 'Patient',
  identifier: [{ system: '', value: '' }],
  name: [{ given: [''], family: '' }],
  gender: 'unknown',
  birthDate: '',
}
// Interfaz para la solicitud de paciente al backend
export interface PatientResponseBackend {
  nationalId: string;
  fhirId?: string;
  ehrId?: string;
  fhirPatientJson: string;
}
