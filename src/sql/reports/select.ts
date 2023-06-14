import LoggerColor from 'node-color-log';
import { dataBase } from '../../config/dataBase';
import { Report } from '../../models/report';
import { Count } from '../../models/util';

export const getReportsStorage = async (
  fields: Partial<Report>,
  options?: {
    returnFields?: string;
    find?: string;
    start?: number;
    dataByPage?: number;
    isCount?: boolean;
  },
) => {
  try {
    const { idReporte, idCliente, idDepartamento, idOperador, tipo, estado } = fields;
    const { returnFields, find, start, dataByPage, isCount } = options || {};

    let SQL = '';
    let Where = '';
    let Response = '*';
    const Limit = `LIMIT ${start || 0}, ${dataByPage || 20}`;

    if (returnFields) Response = returnFields;

    if (idReporte) Where = `WHERE idReporte = '${idReporte}'`;

    if (Where && idCliente) Where = `${Where} AND idCliente = '${idCliente}'`;
    if (idCliente && !Where) Where = `WHERE idCliente = '${idCliente}'`;

    if (Where && idDepartamento) Where = `${Where} AND idDepartamento = '${idDepartamento}'`;
    if (idDepartamento && !Where) Where = `WHERE idDepartamento = '${idDepartamento}'`;

    if (Where && idOperador) Where = `${Where} AND idOperador = '${idOperador}'`;
    if (idOperador && !Where) Where = `WHERE idOperador = '${idOperador}'`;

    if (Where && tipo) Where = `${Where} AND tipo = '${tipo}'`;
    if (tipo && !Where) Where = `WHERE tipo = '${tipo}'`;

    if (Where && estado) Where = `${Where} AND estado = '${idOperador}'`;
    if (estado && !Where) Where = `WHERE estado = '${idOperador}'`;

    if (Where && find)
      Where = `${Where} AND sintomas LIKE '%${find}%' OR naturaleza LIKE '%${find}%'`;
    if (find && !Where) Where = `WHERE sintomas LIKE '%${find}%' OR naturaleza LIKE '%${find}%'`;

    if (isCount) SQL = `SELECT COUNT(*) AS total FROM Reportes ${Where};`;
    else SQL = `SELECT ${Response} FROM Reportes ${Where} ORDER BY create_at DESC ${Limit};`;

    return (await new Promise((resolve, reject) =>
      dataBase.query(SQL, (err, data) => (err ? reject(err) : resolve(data))),
    )) as Report[] | Count;
  } catch (error) {
    LoggerColor.bold().bgColor('red').error(error.message);
    return [];
  }
};
