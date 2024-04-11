import LoggerColor from 'node-color-log';
import { dataBase } from '../../config/dataBase';
import { User } from '../../models/user';

export const UpdateUserStorage = async (options: Partial<User>) => {
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
    idRol,
    medicacion,
    padecimiento,
    pesoCorporal,
    genero,
    alergias,
    avatar,
    pin,
    v_DosPasos,
    nombreFamiliar,
    apellidoFamiliar,
    parentesco,
  } = options;
  const SET: string[] = [];

  if (!idCedula) throw Error(`El id del usuario es requerido para actualizar`);

  if (nombre) SET.push(`nombre = '${nombre}'`);
  if (nombreFamiliar) SET.push(`nombreFamiliar = '${nombreFamiliar}'`);
  if (apellido) SET.push(`apellido = '${apellido}'`);
  if (apellidoFamiliar) SET.push(`apellidoFamiliar = '${apellidoFamiliar}'`);
  if (parentesco) SET.push(`parentesco = '${parentesco}'`);
  if (telefono) SET.push(`telefono = '${telefono}'`);
  if (email) SET.push(`email = '${email}'`);
  if (direccion) SET.push(`direccion = '${direccion}'`);
  if (fechaNacimiento) SET.push(`fechaNacimiento = '${fechaNacimiento}'`);
  if (contrasena) SET.push(`contrasena = '${contrasena}'`);
  if (tipoSangre) SET.push(`idOperador = '${tipoSangre}'`);
  if (idRol) SET.push(`idRol = '${idRol}'`);
  if (medicacion) SET.push(`medicacion = '${medicacion}'`);
  if (padecimiento) SET.push(`padecimiento = '${padecimiento}'`);
  if (pesoCorporal) SET.push(`pesoCorporal = '${pesoCorporal}'`);
  if (genero) SET.push(`genero = '${genero}'`);
  if (alergias) SET.push(`alergias = '${alergias}'`);
  if (avatar) SET.push(`avatar = '${avatar}'`);
  if (pin) SET.push(`pin = '${pin}'`);
  if (typeof v_DosPasos === 'number') SET.push(`v_DosPasos = ${v_DosPasos}`);

  try {
    return (await new Promise((resolve, reject) => {
      dataBase.query(`UPDATE Usuarios SET ${SET.join()} WHERE idCedula = '${idCedula}';`, err =>
        err ? reject(err) : resolve(idCedula),
      );
    })) as typeof idCedula;
  } catch (error) {
    LoggerColor.bold().bgColor('red').error(error.message);
    return false;
  }
};
