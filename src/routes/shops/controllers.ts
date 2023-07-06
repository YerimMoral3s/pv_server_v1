import { Request, Response} from 'express';
import { pool } from "../../db";
import { TShop } from './types';
import { IGetUserAuthInfoRequestWithBody } from '../auth';
import { RowDataPacket } from 'mysql2';

export const findShopByName = async (name: string) => {
  const [result] = await pool.query(`SELECT * from shops WHERE name='${name}'`) as RowDataPacket[];
  return result
}

// export const postUserShop = async (req: Request<TShop>, res: Response) => {
  export const postUserShop =  async (req: IGetUserAuthInfoRequestWithBody<TShop>, res: Response) => {
    const {body, user}= req
    const {name, logo} = body

    if (!name){
      return res.status(400).json({ status: "error", message: 'name is required' });
    }

    const shopExist = await findShopByName(name)

    if (shopExist.length){
      return res.status(400).json({ status: "error", message: 'shop already exist' });
    }

    const [result] = await pool.query('INSERT INTO shops (name, logo, id_user) VALUES (?, ?, ?)', [name, logo, user?.id]) as RowDataPacket[];

    if (result.insertId){
      return res.status(201).json({ 
        status: 'success', 
        data:{
          shop: {
            id: result.insertId,
            name,
            logo,
          }
        }
      });
    }
}

export const getUserShop = async (req: Request, res: Response) => {
  const {params} = req
  const id = params.id
  const [result] = await pool.query(`SELECT * from shops WHERE id=${id}`);
  res.send(`¡Hola desde getUserShop !`);
}





