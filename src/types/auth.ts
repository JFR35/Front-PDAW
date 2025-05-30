/**
 * Interfaz para definir la estructura de datos de un usuario
 */
export interface User {
  userId?: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  roles?: (string | { name: string })[];
}

/**
 * Solicitud de autenticación del user.
 */
export interface AuthRequest {
  email: string;
  password: string;
}

/**
 * Respuesta de la autenticación de la API.
 */
export interface AuthResponse {
  token: string;
  role: string;
  userId: string;
}

/**
 * Interfaz que define la estructura para crear un practitioner
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

/**
 * Representa la estructura de respuesta de la API.
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
