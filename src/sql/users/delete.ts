import LoggerColor from 'node-color-log';
import { dataBase } from '../../config/dataBase';

export const DeleteUserStorage = async (options: { idCedula: string }) => {
  const { idCedula } = options;

  if (!idCedula) throw Error(`El id del usuario es requerido para actualizar`);

  try {
    return (await new Promise((resolve, reject) => {
      dataBase.query(`DELETE FROM Usuarios WHERE idCedula = '${idCedula}';`, err =>
        err ? reject(err) : resolve(idCedula),
      );
    })) as typeof idCedula;
  } catch (error) {
    LoggerColor.bold().bgColor('red').error(error.message);
    return false;
  }
};
