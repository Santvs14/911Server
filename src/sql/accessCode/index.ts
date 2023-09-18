import LoggerColor from 'node-color-log';
import { dataBase } from '../../config/dataBase';
import { AccessCode } from '../../models/accessCode';

export const InsertAccessCodeStorage = async (data: AccessCode) => {
  const { idcode, idCedula, code, used, create_at } = data;

  try {
    return (await new Promise((resolve, reject) => {
      dataBase.query(
        `INSERT INTO acces_Code (
            idcode,
            idCedula,
            code,
            create_at,
            used) VALUES ('${idcode}', '${idCedula}', '${code}', '${create_at}', ${used})`,
        err => (err ? reject(err) : resolve(idcode)),
      );
    })) as typeof idcode;
  } catch (error) {
    LoggerColor.bold().bgColor('red').error(error.message);
    return [];
  }
};
