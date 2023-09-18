export interface AccessCode {
  readonly idcode: string;
  idCedula: string;
  code: string;
  create_at: string | Date;
  used: number;
}
