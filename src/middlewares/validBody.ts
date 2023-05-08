/* eslint-disable use-isnan */
import { Request, Response, NextFunction } from 'express';

export const validBodyRequest = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!Object.keys(req.body).length) {
      throw new Error('Datos vacios, revise y vuelva ha intentarlo');
    }

    const isEmptyValue = (value: unknown) =>
      value === null || value === undefined || value === '' || Number.isNaN(value);

    const BodyArray = Object.entries(req.body);

    BodyArray.map(Bitem => {
      if (isEmptyValue(Bitem[1])) {
        throw new Error(`El campo ${Bitem[0]} es requerido`);
      }
    });

    next();
  } catch (error) {
    res.status(400).json({ status: error.message });
  }
};
