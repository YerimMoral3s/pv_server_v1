import { Request, Response} from 'express';
import { pool } from "../../db";
import { TShop } from './types';
import { IGetUserAuthInfoRequestWithBody } from '../auth';

export const postUserShop =  async (req: IGetUserAuthInfoRequestWithBody<{}>, res: Response) => {
  const {params} = req
  const {name, logo} = params


  const [result] = await pool.query(`INSERT INTO shops (name, logo) VALUES ('${name}', '${logo}')`);



  res.send(`¡Hola desde getUserShop !`);
}

export const getUserShop = async (req: Request, res: Response) => {
  const {params} = req
  const id = params.id
  const [result] = await pool.query(`SELECT * from shops WHERE id=${id}`);
  res.send(`¡Hola desde getUserShop !`);
}





