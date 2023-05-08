import { Request, Response } from 'express';
import EmailValidator from 'email-validator';
import { format } from 'date-fns';
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

export const LoginUser = async (req: Request, res: Response) => {
  req.logger = req.logger.child({ service: 'users', serviceHandler: 'LoginUser' });
  req.logger.info({ status: 'start' });

  try {
    const { email, password, confirPass, idCedula } = req.body;
    let getRol: Rol[] = [];

    if (!EmailValidator.validate(email)) throw Error(`Dirección de correo invalido`);
    if (password.length < 5) throw Error('La clave secreta debe tener 5 caracteres o más');
    if (password !== confirPass)
      throw Error('La contraseña no coincide con la confirmación, revise y vuelva a intentarlo');

    const user = await getUserStorage({ idCedula });
    if (user.length) {
      getRol = await GetRolesStorage({ idRol: user[0].idRol }, { returnFields: 'nameRol' });
    }

    if (!user.length) {
      const getRolDefault = await GetRolesStorage(
        { nameRol: SelectRol.Cliente },
        { returnFields: 'nameRol, idRol' },
      );

      const newUser: User = {
        idCedula,
        idRol: getRolDefault[0].idRol,
        nombre: null,
        apellido: null,
        direccion: null,
        fechaNacimiento: null,
        telefono: null,
        email,
        contrasena: await bcryptjs.hash(password, 10),
        created_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      };

      await InsertUserStorage(newUser);

      newUser.contrasena = '';
      const me = {
        user: newUser,
        token: GenerateToken({ idUser: newUser.idCedula }),
      };

      return res.status(200).json({ me });
    }

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
