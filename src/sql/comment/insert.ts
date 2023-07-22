import LoggerColor from 'node-color-log';
import { dataBase } from '../../config/dataBase';
import { Comment } from '../../models/comment';

export const InsertCommentStorage = async (data: Comment) => {
  const { idComentario, create_at, idEmisor, comentario, idReporte } = data;

  try {
    return (await new Promise((resolve, reject) => {
      dataBase.query(
        `INSERT INTO Comentarios (
            idComentario,
            create_at,
            commentario,
            idEmisor,
            idReporte) VALUES ('${idComentario}', '${create_at}', '${comentario}', '${idEmisor}', '${idReporte}')`,
        err => (err ? reject(err) : resolve(idComentario)),
      );
    })) as typeof idComentario;
  } catch (error) {
    LoggerColor.bold().bgColor('red').error(error.message);
    return [];
  }
};
