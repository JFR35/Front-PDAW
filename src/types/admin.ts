export interface createPractitioner {
  firstName: string
  lastName: string
  email: string
  password: string
  role: string
}
export interface ApiResponse<T> {
  data: T;
  message?: string
  success: boolean
}
