import express from 'express';
import { register } from './controllers';


export const usersRouter = express.Router();

usersRouter.get('/', register);


 