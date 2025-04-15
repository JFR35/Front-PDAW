/**
 * Interfaz que define la estructura para crear
 * un practitioner
 */
export interface createPractitioner {
  firstName: string
  lastName: string
  email: string
  password: string
  role: string
}
// Usada para tipar las solicitudes de la API
export interface ApiResponse<T> {
  data: T;
  message?: string
  success: boolean
}
