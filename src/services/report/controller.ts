/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { InsertReportStorage } from '../../sql/reports/insert';
import { Report, StatusReport, TypeEmergenci, TypeReport } from '../../models/report';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';
import { VerifyToken } from '../../helpers/token';
import { format } from 'date-fns';
import { CountPagination } from '../../helpers/numbers';
import { getReportsStorage } from '../../sql/reports/select';
import { Count } from '../../models/util';
import { GetRolesStorage } from '../../sql/roles/select';
import { SelectRol } from '../../models/rol';
import { UpdateReportStorage } from '../../sql/reports/update';
import { getUserStorage } from '../../sql/users/select';
import { Comment } from '../../models/comment';
import { InsertCommentStorage } from '../../sql/comment/insert';
import { getCommentsReportStorage } from '../../sql/comment/select';
import { PLACE_HOLDER_AVATAR } from '../../util/url';
import { SendNotification } from '../../helpers/firebase';
import { isAudio } from '../../helpers/string';

export const getReports = async (req: Request, res: Response) => {
  req.logger = req.logger.child({ service: 'reports', serviceHandler: 'getReports' });
  req.logger.info({ status: 'start' });

  try {
    const me = req.user;
    const onlyMe = req.query.onlyMe as string;
    const getRol = await GetRolesStorage({ idRol: me.idRol });
    if (!getRol.length) throw Error('No se encontro rol asignado');

    let idCliente: string | undefined = undefined;
    let idOperador: string | undefined = undefined;

    if (getRol[0].nameRol === SelectRol.Cliente) {
      idCliente = me.idCedula;
    }

    if (getRol[0].nameRol === SelectRol.Operador && onlyMe) {
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

    const getDataReports = (await getReportsStorage(
      { tipo, estado, idCliente, idOperador },
      { start, dataByPage, find },
    )) as Report[];

    const reports = await Promise.all(
      getDataReports.map(async report => {
        if (report.idOperador) {
          const getOperator = await getUserStorage(
            { idCedula: report.idOperador },
            { returnFields: 'idCedula, nombre, apellido, email' },
          );

          return {
            operador: { ...getOperator[0] },
            ...report,
          };
        }

        return {
          ...report,
        };
      }),
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
    const { type, naturaleza, sintomas, longitud, latitud, evidenciaBase64 } = req.body;
    const tipo = req.body.tipo as TypeReport;
    const tipoEmergencia = req.body.tipoEmergencia as TypeEmergenci;
    let upload = null;

    if (!['BOMBEROS', 'MEDICINA', 'POLICIAS'].includes(tipoEmergencia)) {
      throw Error('El tipo de emergencia no es valido');
    }

    if (!['SILENCIOSO', 'CIUDADANO', 'SOLIDARIO'].includes(tipo)) {
      throw Error('El tipo de reporte no es valido');
    }

    let idCliente: string | null = null;
    const token: string | undefined = req.header('access-token');

    if (token) {
      const user: any = await VerifyToken({ token });
      if (user) idCliente = user.idCedula;
    }

    if (isAudio(evidenciaBase64)) {
      upload = { url: evidenciaBase64 };
    } else {
      const base = type === 'video' ? 'data:video/mp4;base64' : 'data:image/png;base64';
      upload = await cloudinary.uploader
        .upload(`${base},${evidenciaBase64}`)
        .catch(err => console.log('img > ', err));
    }

    const getReport = (await getReportsStorage({ idCliente }, { last: true })) as Report[];

    const data: Report = {
      idReporte: uuidv4(),
      naturaleza: naturaleza || null,
      sintomas: sintomas || null,
      create_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      longitud,
      latitud,
      evidencia: upload?.url || null,
      idCliente,
      idOperador: null,
      idDepartamento: null,
      estado: 'PENDIENTE',
      tipo,
      number: getReport[0]?.number ? getReport[0].number + 1 : 1,
      tipoEmergencia,
    };

    await InsertReportStorage(data);

    return res.status(200).json({});
  } catch (error) {
    req.logger.error({ status: 'error', code: 500, error: error.message });
    return res.status(500).json({ status: error.message });
  }
};

export const getReport = async (req: Request, res: Response) => {
  req.logger = req.logger.child({ service: 'reports', serviceHandler: 'getReport' });
  req.logger.info({ status: 'start' });

  try {
    const idReporte = req.params.idReporte as string;

    const getReport = (await getReportsStorage({ idReporte })) as Report[];
    if (!getReport.length) throw Error('No se encontro el reporte');
    let report = getReport[0];

    if (getReport[0].idOperador) {
      const getOperador = await getUserStorage({ idCedula: getReport[0].idOperador });
      report = {
        ...report,
        operador: {
          nombre: getOperador[0].nombre,
          apellido: getOperador[0].apellido,
          avatar: getOperador[0].avatar || PLACE_HOLDER_AVATAR,
        },
      };
    }

    if (getReport[0].idCliente) {
      const getCliente = await getUserStorage({ idCedula: getReport[0].idCliente });
      report = {
        ...report,
        cliente: {
          nombre: getCliente[0].nombre,
          apellido: getCliente[0].apellido,
          avatar: getCliente[0].avatar || PLACE_HOLDER_AVATAR,
        },
      };
    }

    return res.status(200).json({ report });
  } catch (error) {
    req.logger.error({ status: 'error', code: 500, error: error.message });
    return res.status(500).json({ status: error.message });
  }
};

export const commentsReport = async (req: Request, res: Response) => {
  req.logger = req.logger.child({ service: 'reports', serviceHandler: 'commentsReport' });
  req.logger.info({ status: 'start' });

  try {
    const idReporte = req.params.idReporte as string;

    const getReport = (await getReportsStorage({ idReporte })) as Report[];
    if (!getReport.length) throw Error('No se encontro el reporte');

    const getComments = (await getCommentsReportStorage({ idReporte })) as Comment[];
    const comments = await Promise.all(
      getComments.map(async com => {
        const getUser = await getUserStorage({ idCedula: com.idEmisor });

        return {
          ...com,
          emisor: {
            nombre: getUser[0].nombre,
            avatar: getUser[0].avatar || PLACE_HOLDER_AVATAR,
          },
        };
      }),
    );

    return res.status(200).json({ comments });
  } catch (error) {
    req.logger.error({ status: 'error', code: 500, error: error.message });
    return res.status(500).json({ status: error.message });
  }
};

export const addCommentReport = async (req: Request, res: Response) => {
  req.logger = req.logger.child({ service: 'reports', serviceHandler: 'addCommentReport' });
  req.logger.info({ status: 'start' });

  try {
    const user = req.user;
    const idReporte = req.params.idReporte as string;
    const { comentario } = req.body;

    const getReport = (await getReportsStorage({ idReporte })) as Report[];
    if (!getReport.length) throw Error('No se encontro el reporte');
    if (getReport[0].estado === 'FINALIZADO')
      throw Error('Este reporte ya se encuentra finalizado');

    const data: Comment = {
      idComentario: uuidv4(),
      create_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      idEmisor: user.idCedula,
      comentario,
      idReporte,
    };

    await InsertCommentStorage(data);

    const getUser = await getUserStorage({ idCedula: user.idCedula });

    const dataResponse = {
      ...data,
      emisor: {
        nombre: getUser[0].nombre,
        avatar: getUser[0].avatar || PLACE_HOLDER_AVATAR,
      },
    };

    if (getReport[0].idCliente !== user.idCedula && getReport[0].idCliente) {
      const getCliente = await getUserStorage({ idCedula: getReport[0].idCliente });

      if (getCliente[0].token) {
        await SendNotification({
          token: getCliente[0].token,
          notification: {
            title: `Tu reporte #${getReport[0]?.number || 1} ha sido respondido`,
            body: `El reporte #${getReport[0]?.number || 1} de ${
              getReport[0].naturaleza
            } ha sido respondido`,
          },
          data: { router: 'Detalle_Historial', params: getReport[0].idReporte },
        });
      }
    }

    return res.status(200).json({ comment: dataResponse });
  } catch (error) {
    req.logger.error({ status: 'error', code: 500, error: error.message });
    return res.status(500).json({ status: error.message });
  }
};

export const admitOperatorReport = async (req: Request, res: Response) => {
  req.logger = req.logger.child({ service: 'reports', serviceHandler: 'admitOperatorReport' });
  req.logger.info({ status: 'start' });

  try {
    const { idReporte } = req.body;
    const me = req.user;
    const getRol = await GetRolesStorage({ idRol: me.idRol });

    if (!getRol.length) throw Error('No se encontro rol asignado');
    if (getRol[0].nameRol !== SelectRol.Operador) {
      throw Error('No eres un operador para atender este reporte');
    }

    const getReport = (await getReportsStorage({ idReporte })) as Report[];
    if (!getReport.length) throw Error('No se encontro el reporte');
    if (getReport[0].idOperador) throw Error('Ya existe un operador en este reporte');
    if (getReport[0].estado === 'FINALIZADO')
      throw Error('Este reporte ya se encuentra finalizado');

    await UpdateReportStorage({ idReporte, idOperador: me.idCedula, estado: 'PROGRESO' });

    if (getReport[0].idCliente) {
      const getUser = await getUserStorage({ idCedula: getReport[0].idCliente });

      if (getUser[0].token) {
        await SendNotification({
          token: getUser[0].token,
          notification: {
            title: `Tu reporte #${getReport[0]?.number || 1} ha sido atendido`,
            body: `El reporte #${getReport[0]?.number || 1} de ${
              getReport[0].naturaleza
            } ha sido atendido`,
          },
          data: { router: 'Detalle_Historial', params: getReport[0].idReporte },
        });
      }
    }

    return res.status(200).json({});
  } catch (error) {
    req.logger.error({ status: 'error', code: 500, error: error.message });
    return res.status(500).json({ status: error.message });
  }
};

export const assignOperatorReport = async (req: Request, res: Response) => {
  req.logger = req.logger.child({ service: 'reports', serviceHandler: 'assignOperatorReport' });
  req.logger.info({ status: 'start' });

  try {
    const { idReporte, idOperador } = req.body;
    const me = req.user;
    const getRolOperador = await GetRolesStorage({ nameRol: SelectRol.Operador });

    if (!getRolOperador.length) throw Error('No se encontro rol asignado');
    if (getRolOperador[0].idRol !== me.idRol) {
      throw Error('No eres un operador para atender este reporte');
    }

    // valid operador assign
    const getUserAssing = await getUserStorage({ idCedula: idOperador });

    if (!getUserAssing.length) throw Error('No se encontro el operador ha asignar');
    if (getRolOperador[0].idRol !== getUserAssing[0].idRol) {
      throw Error('No eres un operador para atender este reporte');
    }

    const getReport = (await getReportsStorage({ idReporte })) as Report[];
    if (!getReport.length) throw Error('No se encontro el reporte');
    if (getReport[0].idOperador) throw Error('Ya existe un operador en este reporte');
    if (getReport[0].estado === 'FINALIZADO')
      throw Error('Este reporte ya se encuentra finalizado');

    await UpdateReportStorage({ idReporte, idOperador, estado: 'PROGRESO' });

    if (getReport[0].idCliente) {
      const getUser = await getUserStorage({ idCedula: getReport[0].idCliente });

      if (getUser[0].token) {
        await SendNotification({
          token: getUser[0].token,
          notification: {
            title: `Tu reporte #${getReport[0]?.number || 1} ha sido atendido`,
            body: `El reporte #${getReport[0]?.number || 1} de ${
              getReport[0].naturaleza
            } ha sido atendido`,
          },
          data: { router: 'Detalle_Historial', params: getReport[0].idReporte },
        });
      }
    }

    return res.status(200).json({});
  } catch (error) {
    req.logger.error({ status: 'error', code: 500, error: error.message });
    return res.status(500).json({ status: error.message });
  }
};

export const cancelOperatorReport = async (req: Request, res: Response) => {
  req.logger = req.logger.child({ service: 'reports', serviceHandler: 'cancelOperatorReport' });
  req.logger.info({ status: 'start' });

  try {
    const { idReporte } = req.body;
    const me = req.user;
    const getRol = await GetRolesStorage({ idRol: me.idRol });

    if (!getRol.length) throw Error('No se encontro rol asignado');
    if (getRol[0].nameRol !== SelectRol.Operador) {
      throw Error('No eres un operador para atender este reporte');
    }

    const getReport = (await getReportsStorage({ idReporte })) as Report[];
    if (!getReport.length) throw Error('No se encontro el reporte');
    if (!getReport[0].idOperador) throw Error('No existe un operador en este reporte');
    if (getReport[0].estado === 'FINALIZADO')
      throw Error('Este reporte ya se encuentra finalizado');

    await UpdateReportStorage({ idReporte, idOperador: null, estado: 'PENDIENTE' });

    if (getReport[0].idCliente) {
      const getUser = await getUserStorage({ idCedula: getReport[0].idCliente });

      if (getUser[0].token) {
        await SendNotification({
          token: getUser[0].token,
          notification: {
            title: `El operador ha sido cancelado`,
            body: `El operadir que gestionaba el reporte #${getReport[0]?.number || 1} de ${
              getReport[0].naturaleza
            } ha sido cancelado`,
          },
          data: { router: 'Detalle_Historial', params: getReport[0].idReporte },
        });
      }
    }

    return res.status(200).json({});
  } catch (error) {
    req.logger.error({ status: 'error', code: 500, error: error.message });
    return res.status(500).json({ status: error.message });
  }
};

export const cancelReport = async (req: Request, res: Response) => {
  req.logger = req.logger.child({ service: 'reports', serviceHandler: 'cancelReport' });
  req.logger.info({ status: 'start' });

  try {
    const { idReporte } = req.body;
    const me = req.user;
    const getRol = await GetRolesStorage({ idRol: me.idRol });

    if (!getRol.length) throw Error('No se encontro rol asignado');
    if (getRol[0].nameRol !== SelectRol.Operador) {
      throw Error('No eres un operador para cancelar este reporte');
    }

    const getReport = (await getReportsStorage({ idReporte })) as Report[];
    if (!getReport.length) throw Error('No se encontro el reporte');
    if (getReport[0].estado === 'FINALIZADO')
      throw Error('Este reporte ya se encuentra finalizado');
    if (getReport[0].estado === 'CANCELADO') throw Error('Este reporte ya se encuentra cancelado');

    await UpdateReportStorage({ idReporte, estado: 'CANCELADO' });

    if (getReport[0].idCliente) {
      const getUser = await getUserStorage({ idCedula: getReport[0].idCliente });

      if (getUser[0].token) {
        await SendNotification({
          token: getUser[0].token,
          notification: {
            title: `Tu reporte #${getReport[0]?.number || 1} ha sido cancelado`,
            body: `El reporte #${getReport[0]?.number || 1} de ${
              getReport[0].naturaleza
            } ha sido cancelado`,
          },
          data: { router: 'Detalle_Historial', params: getReport[0].idReporte },
        });
      }
    }

    return res.status(200).json({});
  } catch (error) {
    req.logger.error({ status: 'error', code: 500, error: error.message });
    return res.status(500).json({ status: error.message });
  }
};

export const finishReport = async (req: Request, res: Response) => {
  req.logger = req.logger.child({ service: 'reports', serviceHandler: 'finishReport' });
  req.logger.info({ status: 'start' });

  try {
    const { idReporte } = req.body;
    const me = req.user;
    const getRol = await GetRolesStorage({ idRol: me.idRol });

    if (!getRol.length) throw Error('No se encontro rol asignado');
    if (getRol[0].nameRol !== SelectRol.Operador) {
      throw Error('No eres un operador para cancelar este reporte');
    }

    const getReport = (await getReportsStorage({ idReporte })) as Report[];
    if (!getReport.length) throw Error('No se encontro el reporte');
    if (getReport[0].estado === 'FINALIZADO')
      throw Error('Este reporte ya se encuentra finalizado');

    await UpdateReportStorage({ idReporte, estado: 'FINALIZADO' });

    if (getReport[0].idCliente) {
      const getUser = await getUserStorage({ idCedula: getReport[0].idCliente });

      if (getUser[0].token) {
        await SendNotification({
          token: getUser[0].token,
          notification: {
            title: `Tu reporte #${getReport[0]?.number || 1} ha finalizado`,
            body: `El reporte #${getReport[0]?.number || 1} de ${
              getReport[0].naturaleza
            } ha finalizado`,
          },
          data: { router: 'Detalle_Historial', params: getReport[0].idReporte },
        });
      }
    }

    return res.status(200).json({});
  } catch (error) {
    req.logger.error({ status: 'error', code: 500, error: error.message });
    return res.status(500).json({ status: error.message });
  }
};
