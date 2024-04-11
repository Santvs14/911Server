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
    tipoSangre,
    created_at,
    idRol,
    medicacion,
    padecimiento,
    pesoCorporal,
    genero,
    alergias,
    avatar,
    pin,
    v_DosPasos,
    token,
  } = user;

  try {
    return (await new Promise((resolve, reject) => {
      dataBase.query(
        `INSERT INTO Usuarios (idCedula, nombre, apellido, telefono, email, direccion, fechaNacimiento, contrasena, tipoSangre, created_at, idRol, medicacion, padecimiento, pesoCorporal, genero, alergias, avatar, pin, v_DosPasos, token) VALUES ('${idCedula}', ${
          nombre ? `'${nombre}'` : null
        }, ${apellido ? `'${apellido}'` : null}, ${
          telefono ? `'${telefono}'` : null
        }, '${email}', ${direccion ? `'${direccion}'` : null}, ${
          fechaNacimiento ? `'${fechaNacimiento}'` : null
        }, '${contrasena}', ${
          tipoSangre ? `'${tipoSangre}'` : null
        }, '${created_at}', '${idRol}', ${medicacion ? `'${medicacion}'` : null}, ${
          padecimiento ? `'${padecimiento}'` : null
        }, ${pesoCorporal ? `'${pesoCorporal}'` : null}, ${genero ? `'${genero}'` : null}, ${
          alergias ? `'${alergias}'` : null
        }, ${avatar ? `'${avatar}'` : null}, ${pin ? `'${pin}'` : null}, ${v_DosPasos}, ${
          token ? `'${token}'` : null
        })`,
        err => (err ? reject(err) : resolve(idCedula)),
      );
    })) as typeof idCedula;
  } catch (error) {
    LoggerColor.bold().bgColor('red').error(error.message);
    return [];
  }
};
