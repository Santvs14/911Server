type TypeSangre = 'AB+' | 'AB-' | 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-';

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
  tipoSangre: TypeSangre | null;
  idRol: string;
  medicacion: string | null;
  padecimiento: string | null;
  pesoCorporal: string | null;
  genero: string | null;
  alergias: string | null;
  avatar: string | null;
  nameRol?: string;
}
