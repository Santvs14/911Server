import express from 'express';
import { RegisterUser, LoginUser, getHello, getMe, AvatarUser } from './controller';
import { auth } from '../../middlewares';
import { validBodyRequest } from '../../middlewares/validBody';

const router = express.Router();
const baseURL = '/users';

router.get(`${baseURL}`, getHello);
router.get(`${baseURL}/me`, auth, getMe);
router.post(`${baseURL}/register`, validBodyRequest, RegisterUser);
router.post(`${baseURL}/login`, validBodyRequest, LoginUser);
router.put(`${baseURL}/avatar`, validBodyRequest, AvatarUser);

export default router;
