import LoggerColor from 'node-color-log';
import { dataBase } from '../../config/dataBase';
import { Rol } from '../../models/rol';

export const GetRolesStorage = async (
  fields: Partial<Rol>,
  options?: { returnFields?: string },
) => {
  const { isActive, idRol, nameRol } = fields;
  const { returnFields } = options || {};
  let Where = '';
  let Response = '*';

  if (returnFields) Response = returnFields;

  if (isActive) Where = `WHERE isActive = ${isActive}`;
  if (idRol) Where = `WHERE idRol = '${idRol}'`;
  if (nameRol) Where = `WHERE nameRol = '${nameRol}'`;

  try {
    return (await new Promise((resolve, reject) => {
      dataBase.query(
        `SELECT ${Response} FROM Roles ${Where} ORDER BY create_at DESC;`,
        (err, data) => (err ? reject(err) : resolve(data)),
      );
    })) as Rol[];
  } catch (error) {
    LoggerColor.bold().bgColor('red').error(error.message);
    return [];
  }
};
