/* eslint-disable @typescript-eslint/ban-types */
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { config } from '../config/environment';
import { User } from '../models/user';
import { getUserStorage } from '../sql/users/select';

interface TokenInterface {
  idCedula: string;
}

const tokenExpiresIn = 720000; // cerca de 8 dias o mas;

export const VerifyToken = async (options: { token: string; isRefresh?: boolean }) => {
  const { token, isRefresh } = options;

  return jwt.verify(
    token,
    isRefresh ? config.JWT_SECRET_REFRESH : config.JWT_SECRET,
    async (err: TokenExpiredError, decoded: TokenInterface) => {
      if (err) throw Error(err.message);

      const user = await getUserStorage({ idCedula: decoded.idCedula });
      if (!user.length) throw new Error('No existe el usuario');

      return user[0] as User;
    },
  );
};

export const GenerateToken = (payload: string | object) => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: tokenExpiresIn });
};
