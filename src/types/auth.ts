// Enviar las credenciales de acceso al inicio de sesión
export interface AuthRequest {
  email: string
  password: string
}

// Tipar la respuesta de la autenticación en auth.ts
export interface AuthResponse {
  token: string
  role: string
  userId: string
}
