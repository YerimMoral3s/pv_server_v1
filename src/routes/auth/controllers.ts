import { Request, Response} from 'express';
import { pool } from "../../db";
import { IGetUserAuthInfoRequest, IGetUserAuthInfoRequestWithBody, TUserAuth } from './types';
import { comparePassword, hashPassword, validateEmail, validatePassword } from '../../utils';
import { TUser } from '../users';
import { OkPacket } from 'mysql2';
const jwt = require('jsonwebtoken');
const secretKey = "PEPE_PICA_PAPAS_SECRET"

const generateTokens = (id: number) =>{
  const accessToken: string = jwt.sign({ id: id }, secretKey, { expiresIn: '1hr' });
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
    return res.status(401).json({ status: "error", message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, secretKey) as { id: number }; 
    
    if (!decoded){
      return res.status(401).json({ status: "error", message: 'Unauthorized' });
    }

    const user = await findUserById(decoded.id)

    req.user = user
    next();

  } catch (error ) {
    return res.status(401).json({ error: 'Unauthorized', message: "Token expired" });
  };
}


export const signIn = async (req: Request<{},{},TUserAuth>, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: "error", message: 'Missing required parameter' });
  }

  if (!validateEmail(email)) {
    return res.status(422).json({ status: "error", message: 'Invalid email address' });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ status: "error", message: 'The password does not meet the security criteria.' });
  }

  const emailExist = await findUserByEmail(email);
  if (emailExist) {
    return res.status(409).json({ status: "error", message: 'This email is already in use' });
  }

  try {
    const hashedPassword = await hashPassword(password);

    const [result] = await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]) as OkPacket[];

    const userId = result.insertId;
    const { refreshToken, accessToken } = generateTokens(userId);

    await pool.query('UPDATE users SET refreshToken = ? WHERE id = ?', [refreshToken, userId]);

    const user = await findUserById(userId);

    const {password: _, ...userWithoutPassword} = user as TUser;

    return res.status(200).json({ 
      status: "success", 
      data: {
        user: {
          ...userWithoutPassword,
          accessToken
        }
      }
    });
  } catch (error) {
    console.error('Error occurred during sign in:', error);
    return res.status(500).json({ status: "error", message: 'Internal server error' });
  }
};



export const login = async (req: Request<{}, {}, TUserAuth>, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: "error", message: 'Missing required parameter' });
  }

  if (!validateEmail(email)) {
    return res.status(422).json({ status: "error", message: 'Invalid email address' });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ status: "error", message: 'Invalid email or password' });
    }

    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ status: "error", message: 'Invalid email or password' });
    }

    const { refreshToken, accessToken } = generateTokens(user.id);

    await pool.query('UPDATE users SET refreshToken = ? WHERE id = ?', [refreshToken, user.id]);

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      status: "success",
      data: {
        user: {
            ...userWithoutPassword,
            refreshToken,
            accessToken
        }
      }
    });
  } catch (error) {
    console.error('Error occurred during login:', error);
    return res.status(500).json({ status: "error", message: 'Internal server error' });
  }
};



export const refreshToken = async (req: IGetUserAuthInfoRequest, res: Response) => {
  const refreshToken = req.headers['authorization']?.split(" ")[1];

  if (!refreshToken) {
    return res.status(401).json({ status: "error", message: 'Unauthorized' });
  }

  if (refreshToken !== req.user?.refreshToken) {
    return res.status(401).json({ status: "error", message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(refreshToken, secretKey) as { id: number };

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.id);

    await pool.query('UPDATE users SET refreshToken = ? WHERE id = ?', [newRefreshToken, decoded.id]);

    return res.status(200).json({ 
      status: "success", 
      data: {
        refreshToken: newRefreshToken,
        accessToken
      }
    });
  } catch (error) {
    console.error('Error occurred during token refresh:', error);
    return res.status(500).json({ status: "error", message: 'Internal server error' });
  }
};



export const test = async (req: IGetUserAuthInfoRequestWithBody<{}>, res: Response) => {
  return res.status(401).json({ msg: 'test paso perro' });

}