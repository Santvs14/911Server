export enum SelectRol {
  Cliente = 'Cliente',
  Operador = 'Operador',
  Admin = 'Administrador',
}

export type NameRol = SelectRol.Cliente | SelectRol.Operador | SelectRol.Admin;
export interface Rol {
  readonly idRol: string;
  nameRol: NameRol;
  create_at: Date | string;
  isActive: number;
}
