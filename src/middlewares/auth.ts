/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user';
import { VerifyToken } from '../helpers/token';

declare module 'express-serve-static-core' {
  interface Request {
    user: User;
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token: string | undefined = req.header('access-token');
    if (!token) throw new Error('Please authenticate');

    const user: any = await VerifyToken({ token });
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ status: error.message });
  }
};
