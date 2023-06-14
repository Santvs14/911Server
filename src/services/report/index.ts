import express from 'express';
import { newReport, getReports } from './controller';
import { validBodyRequest } from '../../middlewares/validBody';
import { auth } from '../../middlewares';

const router = express.Router();
const baseURL = '/reports';

router.get(`${baseURL}`, auth, getReports);
router.post(`${baseURL}/new`, validBodyRequest, newReport);

export default router;
