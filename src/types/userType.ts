/**
 * Interfaz para definir la estructura de un usuario en la aplicación,
 * incluye campos obligatorios y opciones (?)
 * Este tipado se importa a otros archivos como userStore.ts y la vista
 * AdminUsers.ts para garantizar que los datos manipulados cumplan con
 * esta estructura gracias a TS
 */
export interface User {
  userId?: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  roles?: (string | { name: string })[];
}
