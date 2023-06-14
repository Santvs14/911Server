/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { InsertReportStorage } from '../../sql/reports/insert';
import { Report, StatusReport, TypeReport } from '../../models/report';
import { v4 as uuidv4 } from 'uuid';
import { VerifyToken } from '../../helpers/token';
import { format } from 'date-fns';
import { CountPagination } from '../../helpers/numbers';
import { getReportsStorage } from '../../sql/reports/select';
import { Count } from '../../models/util';
import { GetRolesStorage } from '../../sql/roles/select';
import { SelectRol } from '../../models/rol';

export const getReports = async (req: Request, res: Response) => {
  req.logger = req.logger.child({ service: 'reports', serviceHandler: 'getReports' });
  req.logger.info({ status: 'start' });

  try {
    const me = req.user;
    const getRol = await GetRolesStorage({ idRol: me.idRol });
    if (!getRol.length) throw Error('No se encontro rol asignado');

    let idCliente: string | undefined = undefined;
    let idOperador: string | undefined = undefined;

    if (getRol[0].nameRol === SelectRol.Cliente) {
      idCliente = me.idCedula;
    }

    if (getRol[0].nameRol === SelectRol.Operador) {
      idOperador = me.idCedula;
    }

    const page = (req.query.page as string) || '1';
    const tipo = (req.query.tipo as TypeReport) || '';
    const estado = (req.query.tipo as StatusReport) || '';
    const find = (req.query.find as string) || '';

    let pages = 0;
    let start = 0;
    let count = [{ total: 0 }];
    const dataByPage = 20;

    count = (await getReportsStorage(
      { tipo, estado, idCliente, idOperador },
      { isCount: true, find },
    )) as Count;

    if (Number(page)) {
      const pagination = count[0].total / dataByPage;

      pages = CountPagination({ pagination });

      if (Number(page) > 1) {
        start = Math.trunc((Number(page) - 1) * dataByPage);
        start = start + Number(page) - 1;
      }
    }

    const reports = await getReportsStorage(
      { tipo, estado, idCliente, idOperador },
      { start, dataByPage, find },
    );

    return res.status(200).json({ pages, count, reports });
  } catch (error) {
    req.logger.error({ status: 'error', code: 500, error: error.message });
    return res.status(500).json({ status: error.message });
  }
};

export const newReport = async (req: Request, res: Response) => {
  req.logger = req.logger.child({ service: 'reports', serviceHandler: 'newReport' });
  req.logger.info({ status: 'start' });

  try {
    const { naturaleza, sintomas, longitud, latitud, evidencia } = req.body;
    const tipo = req.body.tipo as TypeReport;

    if (!['SILENCIOSO', 'COMPLETO'].includes(tipo)) {
      throw Error('El tipo de reporte no es valido');
    }

    let idCliente: string | null = null;
    const token: string | undefined = req.header('access-token');

    if (token) {
      const user: any = await VerifyToken({ token });
      if (user) idCliente = user.idCedula;
    }

    const data: Report = {
      idReporte: uuidv4(),
      naturaleza: naturaleza || null,
      sintomas: sintomas || null,
      create_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      longitud,
      latitud,
      evidencia,
      idCliente,
      idOperador: null,
      idDepartamento: null,
      estado: 'PENDIENTE',
      tipo,
    };

    await InsertReportStorage(data);
    return res.status(200).json({});
  } catch (error) {
    req.logger.error({ status: 'error', code: 500, error: error.message });
    return res.status(500).json({ status: error.message });
  }
};
