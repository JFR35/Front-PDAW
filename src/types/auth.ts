/**
 * Solicitud de autenticación del user.
 * Define los datos requeridos para el inicio
 * de sesión en el sistema.
 */
export interface AuthRequest {
  email: string
  password: string
}

/**
 * Respuesta de la autenticación de la API.
 * Incluye los datos que se retornan después de
 * la autenticación.
 */
export interface AuthResponse {
  token: string
  role: string
  userId: string
}
