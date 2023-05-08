export interface Rol {
  readonly idRol: string;
  nameRol: string;
  create_at: Date | string;
  isActive: number;
}

export enum SelectRol {
  Cliente = 'Cliente',
  Operador = 'Operador',
  Admin = 'Administrador',
}
