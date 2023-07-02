import express from 'express';
import { getUserShop } from './controllers';


export const shopsRouter = express.Router();

shopsRouter.get('/:id', getUserShop);


 