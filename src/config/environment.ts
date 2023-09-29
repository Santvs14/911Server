import * as envalid from 'envalid';
import path from 'path';

const { str, num } = envalid;

export const config = envalid.cleanEnv(
  process.env,
  {
    DB_HOST: str(),
    DB_USER: str(),
    DB_PASSWORD: str(),
    DB_NAME: str(),
    DB_PORT: num(),
    PORT: num(),
    JWT_SECRET: str(),
    JWT_SECRET_REFRESH: str(),
    API_KEY: str(),
    API_SERET: str(),
    CLOUDINARY_URL: str(),
    CLOUD_NAME: str(),
    SENDGRID_API_KEY: str(),
    ROOT_MAIN: str(),
    PROJECT_ID_FIREBASE: str(),
    CLIENT_EMAIL_FIREBASE: str(),
    BUCKET_URL: str(),
    PRIVATE_KEY_FIREBASE: str(),
  },
  { strict: true, dotEnvPath: path.resolve(__dirname, '../../../.env') },
);
