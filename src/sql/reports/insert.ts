import LoggerColor from 'node-color-log';
import { dataBase } from '../../config/dataBase';
import { Report } from '../../models/report';

export const InsertReportStorage = async (data: Report) => {
  const {
    idReporte,
    naturaleza,
    sintomas,
    create_at,
    longitud,
    latitud,
    evidencia,
    idCliente,
    idOperador,
    idDepartamento,
    estado,
    tipo,
    number,
    tipoEmergencia,
  } = data;

  try {
    return (await new Promise((resolve, reject) => {
      dataBase.query(
        `INSERT INTO Reportes (idReporte,
            naturaleza,
            sintomas,
            create_at,
            longitud,
            latitud,
            evidencia,
            idCliente,
            idOperador,
            idDepartamento,
            estado,
            tipo,
            number,
            tipoEmergencia) VALUES ('${idReporte}', ${naturaleza ? `'${naturaleza}'` : null}, ${
          sintomas ? `'${sintomas}'` : null
        }, '${create_at}', '${longitud}', '${latitud}', ${evidencia ? `'${evidencia}'` : null}, ${
          idCliente ? `'${idCliente}'` : null
        }, ${idOperador ? `'${idOperador}'` : null}, ${
          idDepartamento ? `'${idDepartamento}'` : null
        }, '${estado}', '${tipo}', ${number}, '${tipoEmergencia}')`,
        err => (err ? reject(err) : resolve(idReporte)),
      );
    })) as typeof idReporte;
  } catch (error) {
    LoggerColor.bold().bgColor('red').error(error.message);
    return [];
  }
};
