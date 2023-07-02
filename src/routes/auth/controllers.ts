import { Request, Response} from 'express';
import { pool } from "../../db";
import { IGetUserAuthInfoRequest, IGetUserAuthInfoRequestWithBody, TUserAuth } from './types';
import { comparePassword, hashPassword, validateEmail } from '../../utils';
import { TUser } from '../users';
const jwt = require('jsonwebtoken');
const secretKey = "PEPE_PICA_PAPAS_SECRET"

const generateTokens = (id: number) =>{
  const accessToken: string = jwt.sign({ id: id }, secretKey, { expiresIn: '1m' });
  const refreshToken: string = jwt.sign({ id: id }, secretKey, { expiresIn: '30d' });
  return { accessToken, refreshToken };
}


const findUserByEmail =async  (email: string) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows as TUser[]
  return user.length > 0 ? user[0] : undefined
}


const findUserById =async  (id: number) => {
  const [results] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  const user = results as TUser[]
  return user.length > 0 ? user[0] : undefined
}


export const authenticationToken = async (req: IGetUserAuthInfoRequest, res: Response, next: () => any) =>{
  const token = req.headers['authorization']?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, secretKey) as { id: number }; 
    if (!decoded){
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await findUserById(decoded.id)
    req.user = user
    next();

  } catch (error) {
    return res.status(401).json({ error: error });
  };
}


export const signIn  = async (req: Request<{},{},TUserAuth>, res: Response) => {
  const {email, password} = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing required parameter' });
  }

  if (!validateEmail(email)) {
    return res.status(422).json({ error: 'Invalid email address' });
  }

  // if (!validatePassword(password)) {
  //   return res.status(400).json({ message: 'The password does not meet the security criteria.' });
  // }

  const email_exist = await findUserByEmail(email)
  if (email_exist){
    return res.status(409).json({ message: 'This email already in use' });
  }

  const hashedPassword = await hashPassword(password);

  const [rows] = await pool.query(`INSERT INTO users (email, password) VALUES ('${email}', '${hashedPassword}');`) as any;

  
  const {refreshToken, accessToken} = generateTokens(rows.insertId)

  await pool.query(`UPDATE users SET refreshToken = "${refreshToken}" WHERE id = ${rows.insertId};`);
  const user_id = await findUserById(rows.insertId)

  return   res.status(200).json({
    ...user_id,
    accessToken
  });
}


export const login = async (req: Request<{},{},TUserAuth>, res: Response) => {
  const {email, password} = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing required parameter' });
  }

  if (!validateEmail(email)) {
    return res.status(422).json({ error: 'Invalid email address' });
  }

  const user = await findUserByEmail(email)
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const passwordMatch = await comparePassword(password, user.password)
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const {refreshToken, accessToken} = generateTokens(user.id)

  await pool.query(`UPDATE users SET refreshToken = "${refreshToken}" WHERE id = ${user.id};`) as any;

  return res.status(200).json({
    ...user,
    refreshToken,
    accessToken
  });
}


export const refreshToken = async (req: IGetUserAuthInfoRequest, res: Response) => {
  const _refreshToken = req.headers['authorization']?.split(" ")[1];

  if (!_refreshToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (_refreshToken !== req.user?.refreshToken){
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const decoded = jwt.verify(_refreshToken, secretKey) as { id: number }; 

  const {accessToken, refreshToken} = generateTokens(decoded.id)

  await pool.query(`UPDATE users SET refreshToken = "${refreshToken}" WHERE id = ${decoded.id};`) as any;

  return res.status(200).json({
    refreshToken,
    accessToken
  });
};


export const test = async (req: IGetUserAuthInfoRequestWithBody<{}>, res: Response) => {
  console.log(req.user)
  return res.status(401).json({ error: 'test paso perro' });

}