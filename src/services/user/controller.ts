import { Request, Response } from 'express';
import EmailValidator from 'email-validator';
import { format, isDate } from 'date-fns';
import bcryptjs from 'bcryptjs';
import Locale from 'date-fns/locale/es';
import { GenerateToken } from '../../helpers/token';
import { Rol, SelectRol } from '../../models/rol';
import { User } from '../../models/user';
import { GetRolesStorage } from '../../sql/roles/select';
import { getUserStorage } from '../../sql/users/select';
import { InsertUserStorage } from '../../sql/users/insert';

export const getHello = async (req: Request, res: Response) => {
  req.logger = req.logger.child({ service: 'users', serviceHandler: 'getHello' });
  req.logger.info({ status: 'start' });

  try {
    return res.status(200).json({ saludo: 'Hola, esto es una respuesta desde el servidor' });
  } catch (error) {
    req.logger.error({ status: 'error', code: 500, error: error.message });
    return res.status(500).json({ status: error.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  req.logger = req.logger.child({ service: 'users', serviceHandler: 'getMe' });
  req.logger.info({ status: 'start' });

  try {
    const user = req.user;
    user.contrasena = '';
    user.created_at = format(new Date(user.created_at), 'PPPP', { locale: Locale });

    return res.status(200).json({ me: user });
  } catch (error) {
    req.logger.error({ status: 'error', code: 500, error: error.message });
    return res.status(500).json({ status: error.message });
  }
};

export const RegisterUser = async (req: Request, res: Response) => {
  req.logger = req.logger.child({ service: 'users', serviceHandler: 'RegisterUser' });
  req.logger.info({ status: 'start' });

  try {
    const {
      nombre,
      apellido,
      genero,
      telefono,
      tipoSangre,
      fechaNac,
      direccion,
      peso,
      alergias,
      padecimiento,
      medicacion,
      email,
      password,
      confirmarPass,
      idCedula,
    } = req.body;
    let getRolDefault: Rol[] = [];

    if (!EmailValidator.validate(email)) throw Error(`Dirección de correo invalido`);
    if (password.length < 5) throw Error('La clave secreta debe tener 5 caracteres o más');
    if (password !== confirmarPass)
      throw Error('La contraseña no coincide con la confirmación, revise y vuelva a intentarlo');
    if (!isDate(new Date(fechaNac))) throw Error('Fecha de nacimiento invalido');

    const user = await getUserStorage({ idCedula });
    if (user.length) throw Error('Este usuario ya existe, por favor inicie sesión');

    if (!user.length) {
      getRolDefault = await GetRolesStorage(
        { nameRol: SelectRol.Cliente },
        { returnFields: 'nameRol, idRol' },
      );

      const newUser: User = {
        idCedula,
        idRol: getRolDefault[0].idRol,
        nombre,
        apellido,
        direccion,
        fechaNacimiento: format(new Date(fechaNac).getTime(), 'yyyy-MM-dd'),
        telefono,
        tipoSangre,
        email,
        contrasena: await bcryptjs.hash(password, 10),
        created_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        pesoCorporal: peso,
        medicacion,
        padecimiento,
        alergias,
        genero,
      };

      await InsertUserStorage(newUser);

      newUser.contrasena = '';
      const me = {
        user: newUser,
        token: GenerateToken({ idCedula: newUser.idCedula }),
      };

      return res.status(200).json({ me });
    }

    // si el usuario ya esta registrado !!!!
    const ValidatePassword = await bcryptjs.compare(password, user[0].contrasena);

    if (!ValidatePassword) {
      throw Error('Datos incorrectos, revise e intentelo de nuevo');
    }

    user[0].nameRol = getRolDefault[0].nameRol;
    user[0].contrasena = '';

    const me = {
      user: user[0],
      token: GenerateToken({ idUser: user[0].idCedula }),
    };

    return res.status(200).json({ me });
  } catch (error) {
    req.logger.error({ status: 'error', code: 500, error: error.message });
    return res.status(500).json({ status: error.message });
  }
};

export const LoginUser = async (req: Request, res: Response) => {
  req.logger = req.logger.child({ service: 'users', serviceHandler: 'LoginUser' });
  req.logger.info({ status: 'start' });

  try {
    const { password, idCedula } = req.body;
    let getRol: Rol[] = [];

    const user = await getUserStorage({ idCedula });
    if (!user.length) throw Error('El usuario no existe, registre su cuenta');
    else getRol = await GetRolesStorage({ idRol: user[0].idRol }, { returnFields: 'nameRol' });

    // si el usuario ya esta registrado !!!!
    const ValidatePassword = await bcryptjs.compare(password, user[0].contrasena);

    if (!ValidatePassword) {
      throw Error('Datos incorrectos, revise e intentelo de nuevo');
    }

    user[0].nameRol = getRol[0].nameRol;
    user[0].contrasena = '';

    const me = {
      user: user[0],
      token: GenerateToken({ idUser: user[0].idCedula }),
    };

    return res.status(200).json({ me });
  } catch (error) {
    req.logger.error({ status: 'error', code: 500, error: error.message });
    return res.status(500).json({ status: error.message });
  }
};