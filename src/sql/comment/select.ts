import LoggerColor from 'node-color-log';
import { dataBase } from '../../config/dataBase';
import { Count } from '../../models/util';
import { Comment } from '../../models/comment';

export const getCommentsReportStorage = async (
  fields: Partial<Comment>,
  options?: {
    returnFields?: string;
    find?: string;
    start?: number;
    dataByPage?: number;
    isCount?: boolean;
  },
) => {
  try {
    const { idComentario, idEmisor, idReporte } = fields;
    const { returnFields, find, start, dataByPage, isCount } = options || {};

    let SQL = '';
    let Where = '';
    let Response = '*';
    const Limit = `LIMIT ${start || 0}, ${dataByPage || 20}`;

    if (returnFields) Response = returnFields;

    if (idComentario) Where = `WHERE idComentario = '${idComentario}'`;

    if (Where && idEmisor) Where = `${Where} AND idEmisor = '${idEmisor}'`;
    if (idEmisor && !Where) Where = `WHERE idEmisor = '${idEmisor}'`;

    if (Where && idReporte) Where = `${Where} AND idReporte = '${idReporte}'`;
    if (idReporte && !Where) Where = `WHERE idReporte = '${idReporte}'`;

    if (Where && find) Where = `${Where} AND comentario LIKE '%${find}%'`;
    if (find && !Where) Where = `WHERE comentario LIKE '%${find}%'`;

    if (isCount) SQL = `SELECT COUNT(*) AS total FROM Comentarios ${Where};`;
    else SQL = `SELECT ${Response} FROM Comentarios ${Where} ORDER BY create_at DESC ${Limit};`;

    return (await new Promise((resolve, reject) =>
      dataBase.query(SQL, (err, data) => (err ? reject(err) : resolve(data))),
    )) as Comment[] | Count;
  } catch (error) {
    LoggerColor.bold().bgColor('red').error(error.message);
    return [];
  }
};
