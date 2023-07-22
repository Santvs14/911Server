export interface Comment {
  readonly idComentario: string;
  create_at: string | Date;
  comentario: string;
  idEmisor: string;
  idReporte: string;
}
