import express from 'express';
import admin from 'firebase-admin';
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

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: config.PROJECT_ID_FIREBASE,
    clientEmail: config.CLIENT_EMAIL_FIREBASE,
    privateKey: `-----BEGIN PRIVATE KEY-----\n${config.PRIVATE_KEY_FIREBASE}\nAW3HM9jlA3Sc29m2IXQKcnlsLVTZrJcHU562pC9sAJeGkujRIp+3xeqppgf4sSe6\nkKuyhClvsmvYXM+URn3l/6u0J2x89vNJ+WaetMomHgFajKbAXNM/bBE/CFsJFnhl\nnBZJhdrfXWZmib4hiaLT50wuq+eOqSBTWQ5Ysv1ivEKbAPABcQhSt3q5Pyl+Jbda\ng+4ptuig1dX8odZtu2PmhdOFu+e8HUT+GCAiNmkoU+y5q2/7ckfRXqvoF15t3mJn\nIO05D8Tlm+txXUn6/z3EVqhRn59jPNGJ4+iAlIzUIR4BXiFfGYgnIj2NgGKHTRia\nIuqPS/m5AgMBAAECggEAAfg/84ccb/wgunAnYDRD+fuaKMhR7K4zB0Ira+uKztSR\nJkUI9TFi+GJnnBtJ2hrBDFub84CeYTz/n1pxEAfiPbiU58OM7dAhrwm22keci2Z6\nnDIekh8h++9wKB9qwGRYWWDUN0amYA++JOQxfOU4lLD3fIj6ihl0HaLRI1oa0YtO\nG3uluGrZgjoh2PKk2lA7/rowMglfdd4/L3Lcz6y/BJ/IT70IScyUuJ+LgIlf73WO\nzwrUgwVTMFeX6zKdgJ7jp53AgbzFkvYSrtSxzQoYlAJKjmXJl6u88zpY788YzFol\nGwmw1X075lixTWrvaTQUacsXPzB+mJQUFd8BOURNiQKBgQDNx0e8OTc9oE/n3x4d\nuhf48xV8Sx6bNIF0GcGwqIRVSTKCGEGYRDR9J0KMwc/CjA3OKD6WLpbruxZySiqu\n3nB5Kuens3JXDFtn4r9RlLFkd6dxdsIEeXRJVYw59FppCzhy0g2vTRfKi5yi8hZ4\nzm53SafirMQwUxPt7zNCYfJpDQKBgQC6MoDckP44PgDi8lp+4yXquo0Xcasq7sF7\nltHk5TS+kSFX5JIZaFdnzLBRRyZUIhy9vlxEsL2N2aQY/rRXFOB7ipehEt+0gFYe\nA7/0d7qmciYsToCPuKbRt0XbGXBd1bvP5cEwGE8VN95e1HDRVeb8uDoVVz1fcjSE\nd9uYEZcQXQKBgQCUmEv/6p0uXj51ZRPdSY2YEwk32RL/5rl4ekT46aet4o6bjSKI\n7u+sVJZlCGubxAEQFtWjI3+OOGpsG4yY/D3h8Y6Y9iciHuU+rmmTYrl6oEEE2Uof\nawkDD8iT7RUAd77Kg06ogRYmCA0TSZfaos74SvL15+ZAMy3YCnxMemhPXQKBgGJo\n+u6Yu6RiMPnB+c6Co7GyM4wmib9BPYXiqsD926i08BiSOB2xpjC4YKA0qK9i8Cnh\nCMdNWoI0e6SySgKUiCkDkSyS2yV9hwaKGNROy5nZTw+v1gcgIxtIcGVixp7xrjgt\nSLPwxSuDwcYBJjed3V3IyPoqh8eAhv1Uk/2FnoAJAoGAQgfGxwfz+e+MWppcP8mM\nPXL8fmb9JVMy6Ej4uZjo8DN53SKCo+y2b0ySW41lXdxNMI/EZQ3vpOopnqd6rRHK\nEUZd+W3/+DqbNvSO9V6hptQdTFJoi0TrZ6AurRIO0ZbBNNG0z/ejgllJqK6TqE4F\nJu1yVyZWF+nu0opbMDtvWgQ=\n-----END PRIVATE KEY-----\n`,
  }),
  storageBucket: config.BUCKET_URL,
});

app.locals.bucket = admin.storage().bucket();

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
  secure: true,
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
