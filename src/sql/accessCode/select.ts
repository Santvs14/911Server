import LoggerColor from 'node-color-log';
import { dataBase } from '../../config/dataBase';
import { AccessCode } from '../../models/accessCode';

export const GetAccessCodeStorage = async (
  fields: Partial<AccessCode>,
  options?: { returnFields?: string },
) => {
  const { code, idCedula, idcode } = fields;
  const { returnFields } = options || {};
  let Where = '';
  let Response = '*';

  if (returnFields) Response = returnFields;

  if (idcode) Where = `WHERE idcode = ${idcode}`;

  if (Where && idCedula) Where = `${Where} AND idCedula = '${idCedula}'`;
  if (idCedula && !Where) Where = `WHERE idCedula = '${idCedula}'`;

  if (Where && code) Where = `${Where} AND code = '${code}'`;
  if (code && !Where) Where = `WHERE code = '${code}'`;

  try {
    return (await new Promise((resolve, reject) => {
      dataBase.query(
        `SELECT ${Response} FROM acces_Code ${Where} ORDER BY create_at DESC;`,
        (err, data) => (err ? reject(err) : resolve(data)),
      );
    })) as AccessCode[];
  } catch (error) {
    LoggerColor.bold().bgColor('red').error(error.message);
    return [];
  }
};
