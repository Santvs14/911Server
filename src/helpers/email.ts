/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
import LoggerColor from 'node-color-log';
import sgMail, { MailDataRequired } from '@sendgrid/mail';
import { config } from '../config/environment';

export const SendEMail = (options: { data: MailDataRequired | MailDataRequired[] }) => {
  sgMail.setApiKey(config.SENDGRID_API_KEY);

  sgMail
    .send(options.data)
    .then(() => {
      LoggerColor.bold().bgColor('blue').info('Email enviado con exito');
    })
    .catch(error => {
      LoggerColor.bold().bgColor('red').error(error.message);
    });
};
