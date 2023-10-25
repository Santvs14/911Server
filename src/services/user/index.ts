import express from 'express';
import {
  RegisterUser,
  LoginUser,
  getUsers,
  addUser,
  getMe,
  ValidAccessCodeUser,
  AvatarUser,
  UpdateUser,
} from './controller';
import { auth } from '../../middlewares';
import { validBodyRequest } from '../../middlewares/validBody';

const router = express.Router();
const baseURL = '/users';

router.get(`${baseURL}`, getUsers);
router.get(`${baseURL}/me`, auth, getMe);
router.post(`${baseURL}/add`, auth, validBodyRequest, addUser);
router.post(`${baseURL}/register`, validBodyRequest, RegisterUser);
router.post(`${baseURL}/login`, validBodyRequest, LoginUser);
router.post(`${baseURL}/validAccessCode`, auth, validBodyRequest, ValidAccessCodeUser);
router.put(`${baseURL}/avatar`, auth, validBodyRequest, AvatarUser);
router.put(`${baseURL}`, auth, validBodyRequest, UpdateUser);

export default router;
