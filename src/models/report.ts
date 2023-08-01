import { User } from './user';

export type StatusReport = 'PENDIENTE' | 'PROGRESO' | 'FINALIZADO' | 'CANCELADO';
export type TypeReport = 'SILENCIOSO' | 'COMPLETO';

export interface Report {
  readonly idReporte: string;
  naturaleza: string | null;
  sintomas: string | null;
  create_at: string | Date;
  longitud: string;
  latitud: string;
  evidencia: string | null;
  idCliente: string | null;
  idOperador: string | null;
  idDepartamento: string | null;
  estado: StatusReport;
  tipo: TypeReport;
  number: number;
  operador?: Partial<User>;
  cliente?: Partial<User>;
}
