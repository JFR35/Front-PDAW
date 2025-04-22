
## Desarrollo
El frontend está desarrollado con **Vue 3**, **Pinia** para la gestión del estado, **TypeScript** para un tipado fuerte y **Vue Router** para la navegación.
La aplicación permite a los usuarios autenticarse, gestionar perfiles de profesionales sanitarios (`Practitioner`) basados en el estándar FHIR, y acceder a funcionalidades según sus roles (`ROLE_PRACTITIONER`, `ROLE_ADMIN`).

### Características
- **Gestión del estado**: Pinia permite manejar el estado de los recursos FHIR y la autenticación, con stores dedicados (ej: `practitionerStore.ts`, `AuthStore.ts`).

- **Tipado fuerte**: TypeScritp asegura que los datos manipulados, en especial con recursos FHIR respeten la estructura definida en el backend.

- **Autenticación**: Los usuarios se autentican mediante un JWT almacenado en `LocalStorage` para proteger rutas según el rol.
- **Interfaz**: Los formularios para crear/actualizar perfiles `Practitioner` están diseñados para cumplir con las restricciones del perfil FHIR (campos obligatorios).




### Ejecución
```bash
cd C:\Front-PDAW\Front-PDAW
nmp install
npm run dev