import express from 'express';
import { LoginUser, getHello, getMe } from './controller';
import { auth } from '../../middlewares';
import { validBodyRequest } from '../../middlewares/validBody';

const router = express.Router();
const baseURL = '/users';

router.get(`${baseURL}`, getHello);
router.get(`${baseURL}/me`, auth, getMe);
router.post(`${baseURL}/login`, validBodyRequest, LoginUser);
export default router;
