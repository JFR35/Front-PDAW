
export interface Patient {
  id: number;
  name: string;
  age: number;
}
// Tipado para la respuesta de la API
export interface ApiResponse<T> {
  data: T;
  message?: string
  success: boolean
}
