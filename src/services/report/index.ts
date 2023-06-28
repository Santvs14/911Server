import express from 'express';
import {
  newReport,
  getReports,
  admitOperatorReport,
  assignOperatorReport,
  cancelOperatorReport,
} from './controller';
import { validBodyRequest } from '../../middlewares/validBody';
import { auth } from '../../middlewares';

const router = express.Router();
const baseURL = '/reports';

router.get(`${baseURL}`, auth, getReports);
router.post(`${baseURL}/new`, validBodyRequest, newReport);
router.put(`${baseURL}/admit`, auth, validBodyRequest, admitOperatorReport);
router.put(`${baseURL}/assign`, auth, validBodyRequest, assignOperatorReport);
router.put(`${baseURL}/cancel/operador`, auth, validBodyRequest, cancelOperatorReport);

export default router;
