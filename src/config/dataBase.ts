/* eslint-disable @typescript-eslint/no-explicit-any */
import mysql from 'mysql';
import { config } from './environment';

const connection = mysql.createPool({
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  port: config.DB_PORT,
  charset: 'utf8mb4_general_ci',
});

const SmsConect = `Conectado MySQL con exito ✅ Base de datos: ${config.DB_NAME}`;
console.log(SmsConect);

connection.on('err', err => {
  if (err) {
    console.log(err);
    connection.end();
  }
});

export const dataBase = connection;
