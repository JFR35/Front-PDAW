/**
 * Interfaz que define la estructura para crear un practitioner
 * Esta interfaz define la estructura que debe sevguir el objeto
 * enviado en una solicitud para registrar un Practitioner en
 * el sistema.
 */
export interface CreatePractitioner {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  specialty?: string;
  address?: string;
}

/**
 * Representa la estructura de respuesta de la API.
 * Se utiliza para tipar las respuestas de la API y
 * asegurar que contenga los datos esperados
 * @template T Tipo de datos contenidos en la respuesta.
*/
export interface ApiResponse<T> {
  data: T;
  message?: string // Mensaje sobre la respuesta
  success: boolean
}
