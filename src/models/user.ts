export interface User {
  readonly idCedula: string;
  nombre: string | null;
  apellido: string | null;
  telefono: string | null;
  email: string;
  direccion: string | null;
  fechaNacimiento: string | null;
  contrasena: string;
  created_at: Date | string;
  idRol: string;
  nameRol?: string;
}
