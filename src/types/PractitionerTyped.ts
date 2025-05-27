// src/types/PractitionerTyped.ts
export interface Identifier {
  system: string;
  value: string;
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';
}

export interface HumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  family: string;
  given: string[];
}

export interface Coding {
  system?: string;
  code?: string;
  display?: string;
}

export interface CodeableConcept {
  coding?: Coding[];
  text?: string;
}

export interface Qualification {
  code: CodeableConcept;
  issuer?: { display?: string };
}

export interface FhirPractitioner {
  resourceType: 'Practitioner';
  id?: string;
  meta?: { profile?: string[] };
  identifier: Identifier[];
  name: HumanName[];
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate: string;
  qualification?: Qualification[];
}

export interface FhirPractitionerEntity {
  id: string;
  nationalId: string;
  fhirId?: string;
  name?: string;
  specialty?: string;
  resourcePractitionerJson: string;
  parsedPractitioner?: FhirPractitioner;
}

export const emptyPractitioner: FhirPractitioner = {
  resourceType: 'Practitioner',
  identifier: [{ system: '', value: '' }],
  name: [{ given: [''], family: '' }],
  gender: 'unknown',
  birthDate: '',
  qualification: [{ code: { text: '' } }],

};
