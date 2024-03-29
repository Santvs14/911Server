import LoggerColor from 'node-color-log';
import { getMessaging } from 'firebase-admin/messaging';
import { app } from '../app';

type NotificationBody = {
  title: string;
  body: string;
  imageUrl?: string;
};
type NotificationData = {
  [key: string]: string;
};

export const SendNotification = async (options: {
  token: string;
  notification: NotificationBody;
  data?: NotificationData;
}) => {
  const { token, notification, data } = options;

  try {
    // await admin.messaging().send({ notification, token, data });
    await getMessaging().send({ token, notification, data });
    LoggerColor.bold().bgColor('blue').info('Send Success ', token);
  } catch (error) {
    LoggerColor.bold().bgColor('red').error(error.message);
  }
};

export const UploadFileFirebase = async (options: { path: string; buffer: Buffer }) => {
  const { path, buffer } = options;

  try {
    await app.locals.bucket.file(path).createWriteStream().end(buffer);
  } catch (error) {
    LoggerColor.bold().bgColor('red').error(error.message);
  }
};
