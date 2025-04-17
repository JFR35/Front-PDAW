/**
 * Interfaz que define la estructura para crear
 * un practitioner
 */
export interface CreatePractitioner {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  specialty?: string;
  phone?: string;
  address?: string;
}

// Usada para tipar las solicitudes de la API
export interface ApiResponse<T> {
  data: T;
  message?: string
  success: boolean
}
