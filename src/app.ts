import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logger } from './middlewares';
import { v2 as cloudinary } from 'cloudinary';

import { config } from './config/environment';
import User from './services/user';
import Report from './services/report';
import { HOST_ADMIN } from './util/url';

export const app = express();

app.use(
  cors({
    origin: HOST_ADMIN,
  }),
);

app.use(helmet());
app.use(
  '/api',
  rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutos,
    max: 1500,
    message: 'Demasiadas solicitudes a partir de esta IP, inténtalo de nuevo después de 30 minutos',
  }),
);

cloudinary.config({ 
  cloud_name: config.CLOUD_NAME,
  api_key: config.API_KEY, 
  api_secret: config.API_SERET,
  secure: true
});

app.use(function (_req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use('/static', express.static('public'));
app.set('port', config.PORT);
app.use(
  express.urlencoded({
    extended: true,
    limit: '200mb',
  }),
);

app.use((req, res, next) => {
  // if (!req.get('origin')) return res.status(401).json({ message: 'Api rest Meniuz App' });
  express.json({ limit: '200mb' })(req, res, next);
});

app.use('/api', logger, [User, Report]);

app.listen(app.get('port'), () => {
  console.log(`🚀 Server ready at http://localhost:${app.get('port')}`);
});

// ConfigSocketIo(server);
