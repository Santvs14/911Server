import LoggerColor from 'node-color-log';
import { dataBase } from '../../config/dataBase';
import { User } from '../../models/user';

export const InsertUserStorage = async (user: User) => {
  const {
    idCedula,
    nombre,
    apellido,
    telefono,
    email,
    direccion,
    fechaNacimiento,
    contrasena,
    created_at,
    idRol,
  } = user;

  try {
    return (await new Promise((resolve, reject) => {
      dataBase.query(
        `INSERT INTO Usuarios (idCedula, nombre, apellido, telefono, email, direccion, fechaNacimiento, contrasena, created_at, idRol) VALUES ('${idCedula}', ${
          nombre ? `'${nombre}'` : null
        }, ${apellido ? `'${apellido}'` : null}, ${
          telefono ? `'${telefono}'` : null
        }, '${email}', ${direccion ? `'${direccion}'` : null}, ${
          fechaNacimiento ? `'${fechaNacimiento}'` : null
        }, '${contrasena}', '${created_at}', '${idRol}')`,
        err => (err ? reject(err) : resolve(idCedula)),
      );
    })) as typeof idCedula;
  } catch (error) {
    LoggerColor.bold().bgColor('red').error(error.message);
    return [];
  }
};
