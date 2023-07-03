import express from 'express';
import { getUserShop, postUserShop } from './controllers';
import { authenticationToken } from '../auth';


export const shopsRouter = express.Router();

shopsRouter.post('/', authenticationToken, postUserShop);
shopsRouter.get('/:id', getUserShop);


 