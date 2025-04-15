// Topa los datos del pacientes para cumplor con estándar FHIR
export interface Patient {
  resourceType: 'Patient';
  id?: number;
  identifier: {
    system: string;
    value: string;
  }[];
  name: {
    use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
    family?: string;
    given: string[];
  }[];
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate: string;
  text?: { // Corresponds to FHIR narrative
    status: 'generated' | 'extensions' | 'additional' | 'empty';
    div: string; // Should be valid XHTML
  };
}
// Para crear un nuevo paciente en el formulario
export const emptyPatient: Patient = {
  resourceType: 'Patient',
  identifier: [{ system: '', value: '' }],
  name: [{ given: [''] }],
  gender: 'unknown',
  birthDate: '',
  text: { status: 'generated', div: '<div xmlns="http://www.w3.org/1999/xhtml"></div>' }, // Basic empty narrative
};
