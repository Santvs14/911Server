/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import EmailValidator from 'email-validator';
import { v2 as cloudinary } from 'cloudinary';
import { format, isDate } from 'date-fns';
import bcryptjs from 'bcryptjs';
import Locale from 'date-fns/locale/es';
import { GenerateToken } from '../../helpers/token';
import { Rol, SelectRol } from '../../models/rol';
import { User } from '../../models/user';
import { GetRolesStorage } from '../../sql/roles/select';
import { getUserStorage } from '../../sql/users/select';
import { InsertUserStorage } from '../../sql/users/insert';
import { HOST_ADMIN } from '../../util/url';
import { UpdateUserStorage } from '../../sql/users/update';
import { getReportsStorage } from '../../sql/reports/select';
import { Count } from '../../models/util';

export const getUsers = async (req: Request, res: Response) => {
  req.logger = req.logger.child({ service: 'users', serviceHandler: 'getHello' });
  req.logger.info({ status: 'start' });

  try {
    const find = req.query.find as string;
    const idRol = req.query.idRol as string;

    const getRol = await GetRolesStorage({ idRol });

    const getUsers = await getUserStorage({ idRol }, { find });
    const users = await Promise.all(
      getUsers.map(async user => {
        let getReportsN = [{ total: 0 }];

        if (getRol[0].nameRol === SelectRol.Operador) {
          getReportsN = (await getReportsStorage(
            { idOperador: user.idCedula },
            { isCount: true },
          )) as Count;
        }

        if (getRol[0].nameRol === SelectRol.Cliente) {
          getReportsN = (await getReportsStorage(
            { idCliente: user.idCedula },
            { isCount: true },
          )) as Count;
        }

        return {
          ...user,
          nReports: getReportsN[0].total,
        };
      }),
    );

    return res.status(200).json({ users });
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
      avatarBase64,
    } = req.body;
    let getRolDefault: Rol[] = [];

    if (!EmailValidator.validate(email)) throw Error(`Dirección de correo invalido`);
    if (password.length < 5) throw Error('La clave secreta debe tener 5 caracteres o más');
    if (password !== confirmarPass)
      throw Error('La contraseña no coincide con la confirmación, revise y vuelva a intentarlo');
    if (!isDate(new Date(fechaNac))) throw Error('Fecha de nacimiento invalido');

    const user = await getUserStorage({ idCedula });
    if (user.length) throw Error('Este usuario ya existe, por favor inicie sesión');
    if (!avatarBase64) throw Error('La foto de perfil es requerido');

    if (HOST_ADMIN.find(h => h === req.get('origin'))) {
      getRolDefault = await GetRolesStorage(
        { nameRol: SelectRol.Operador },
        { returnFields: 'nameRol, idRol' },
      );
    } else {
      getRolDefault = await GetRolesStorage(
        { nameRol: SelectRol.Cliente },
        { returnFields: 'nameRol, idRol' },
      );
    }

    const upload = await cloudinary.uploader
      .upload(`data:image/png;base64,${avatarBase64}`)
      .catch(err => console.log('img > ', err));

    const newUser: User = {
      idCedula,
      idRol: getRolDefault[0].idRol,
      nombre: nombre || null,
      apellido: apellido || null,
      direccion: direccion || null,
      fechaNacimiento: fechaNac ? format(new Date(fechaNac).getTime(), 'yyyy-MM-dd') : null,
      telefono: telefono || null,
      tipoSangre: tipoSangre || null,
      email,
      contrasena: await bcryptjs.hash(password, 10),
      created_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      pesoCorporal: peso || null,
      medicacion: medicacion || null,
      padecimiento: padecimiento || null,
      alergias: alergias || null,
      genero: genero || null,
      avatar: upload?.url || null,
      pin: null,
      v_DosPasos: 0,
    };

    await InsertUserStorage(newUser);

    newUser.contrasena = '';
    if (newUser.fechaNacimiento) {
      newUser.fechaNacimiento = format(new Date(newUser.fechaNacimiento).getTime(), 'yyyy-MM-dd');
    }
    const me = {
      user: newUser,
      token: GenerateToken({ idCedula: newUser.idCedula }),
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
    if (user[0].fechaNacimiento) {
      user[0].fechaNacimiento = format(new Date(user[0].fechaNacimiento).getTime(), 'yyyy-MM-dd');
    }

    console.log('user > ', idCedula, user[0]);

    const me = {
      user: user[0],
      token: GenerateToken({ idCedula: user[0].idCedula }),
    };

    return res.status(200).json({ me });
  } catch (error) {
    req.logger.error({ status: 'error', code: 500, error: error.message });
    return res.status(500).json({ status: error.message });
  }
};

export const AvatarUser = async (req: Request, res: Response) => {
  req.logger = req.logger.child({ service: 'users', serviceHandler: 'AvatarUser' });
  req.logger.info({ status: 'start' });

  try {
    const me = req.user;
    const { base64Avatar } = req.body;

    cloudinary.uploader
      .upload(base64Avatar)
      .then(async result => {
        await UpdateUserStorage({ idCedula: me.idCedula, avatar: result.url });
      })
      .catch(err => console.error(err));

    return res.status(200).json({});
  } catch (error) {
    req.logger.error({ status: 'error', code: 500, error: error.message });
    return res.status(500).json({ status: error.message });
  }
};

export const UpdateUser = async (req: Request, res: Response) => {
  req.logger = req.logger.child({ service: 'users', serviceHandler: 'UpdateUser' });
  req.logger.info({ status: 'start' });

  try {
    const me = req.user;
    const dataUser = req.body;

    await UpdateUserStorage({ idCedula: me.idCedula, ...dataUser });

    return res.status(200).json({});
  } catch (error) {
    req.logger.error({ status: 'error', code: 500, error: error.message });
    return res.status(500).json({ status: error.message });
  }
};
