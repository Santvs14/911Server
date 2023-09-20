import LoggerColor from 'node-color-log';
import { dataBase } from '../../config/dataBase';
import { User } from '../../models/user';

export const getUserStorage = async (
  fields: Partial<User>,
  options?: { returnFields?: string; find?: string; start?: number; dataByPage?: number },
) => {
  try {
    const { idCedula, idRol, email } = fields;
    const { returnFields, find, start, dataByPage } = options || {};

    let Where = '';
    let Response = '*';
    const Limit = `LIMIT ${start || 0}, ${dataByPage || 20}`;

    if (returnFields) Response = returnFields;

    if (idCedula) Where = `WHERE idCedula = '${idCedula}'`;
    if (idRol) Where = `WHERE idRol = '${idRol}'`;
    if (email) Where = `WHERE email = '${email}'`;
    if (find && Where) {
      Where = `${Where} AND (nombre LIKE '%${find}%' OR apellido LIKE '%${find}%' OR email LIKE '%${find}%')`;
    }
    if (find && !Where) {
      Where = `WHERE nombre LIKE '%${find}%' OR apellido LIKE '%${find}%' OR email LIKE '%${find}%'`;
    }

    return (await new Promise((resolve, reject) =>
      dataBase.query(
        `SELECT ${Response} FROM Usuarios ${Where} ORDER BY created_at DESC ${Limit};`,
        (err, data) => (err ? reject(err) : resolve(data)),
      ),
    )) as User[];
  } catch (error) {
    LoggerColor.bold().bgColor('red').error(error.message);
    return [];
  }
};
