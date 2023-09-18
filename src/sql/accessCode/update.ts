import LoggerColor from 'node-color-log';
import { dataBase } from '../../config/dataBase';
import { AccessCode } from '../../models/accessCode';

export const UpdateAccessCodeStorage = async (options: Partial<AccessCode>) => {
  const { idcode, used } = options;
  const SET: string[] = [];

  if (!idcode) throw Error(`El id del codigo es requerido para actualizar`);
  if (typeof used === 'number') SET.push(`used = ${used}`);

  if (!SET.length) throw Error('No hay valores para actualizar');

  try {
    return (await new Promise((resolve, reject) => {
      dataBase.query(`UPDATE acces_Code SET ${SET.join()} WHERE idcode = '${idcode}';`, err =>
        err ? reject(err) : resolve(idcode),
      );
    })) as typeof idcode;
  } catch (error) {
    LoggerColor.bold().bgColor('red').error(error.message);
    return false;
  }
};
