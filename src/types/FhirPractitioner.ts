export interface FhirPractitioner {
  resourceType: 'Practitioner';
  id?: string;
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

export interface FhirPractitionerEntity {
  id: string;
  resourcePractitionerJson: string;
  parsedPractitioner?: FhirPractitioner;
}
