import LoggerColor from 'node-color-log';
import { dataBase } from '../../config/dataBase';
import { Report } from '../../models/report';

export const UpdateReportStorage = async (options: Partial<Report>) => {
  const {
    idReporte,
    naturaleza,
    sintomas,
    longitud,
    latitud,
    evidencia,
    idCliente,
    idOperador,
    idDepartamento,
    estado,
    tipo,
  } = options;
  const SET: string[] = [];

  if (!idReporte) throw Error(`El id del reporta es requerido para actualizar`);

  if (naturaleza) SET.push(`naturaleza = '${naturaleza}'`);
  if (sintomas) SET.push(`sintomas = '${sintomas}'`);
  if (longitud) SET.push(`longitud = '${longitud}'`);
  if (latitud) SET.push(`latitud = '${latitud}'`);
  if (evidencia) SET.push(`evidencia = '${evidencia}'`);
  if (idCliente) SET.push(`idCliente = '${idCliente}'`);
  if (idDepartamento) SET.push(`idDepartamento = '${idDepartamento}'`);
  if (idOperador) SET.push(`idOperador = '${idOperador}'`);
  if (estado) SET.push(`estado = '${estado}'`);
  if (tipo) SET.push(`tipo = '${tipo}'`);

  try {
    return (await new Promise((resolve, reject) => {
      dataBase.query(`UPDATE Reportes SET ${SET.join()} WHERE idReporte = '${idReporte}';`, err =>
        err ? reject(err) : resolve(idReporte),
      );
    })) as typeof idReporte;
  } catch (error) {
    LoggerColor.bold().bgColor('red').error(error.message);
    return false;
  }
};
