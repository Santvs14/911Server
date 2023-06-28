import express from 'express';
import { newReport, getReports, admitOperatorReport, assignOperatorReport } from './controller';
import { validBodyRequest } from '../../middlewares/validBody';
import { auth } from '../../middlewares';

const router = express.Router();
const baseURL = '/reports';

router.get(`${baseURL}`, getReports);
router.post(`${baseURL}/new`, validBodyRequest, newReport);
router.put(`${baseURL}/admit`, auth, validBodyRequest, admitOperatorReport);
router.put(`${baseURL}/assign`, auth, validBodyRequest, assignOperatorReport);

export default router;
