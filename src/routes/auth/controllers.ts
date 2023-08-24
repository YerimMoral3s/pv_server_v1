import { Request, Response} from 'express';
import { pool } from "../../db";
import { IGetUserAuthInfoRequest, IGetUserAuthInfoRequestWithBody, TUserAuth } from './types';
import { comparePassword, hashPassword, returnError, returnSuccess, validateEmail, validatePassword } from '../../utils';
import { TUserCreate } from '../users';
import { OkPacket } from 'mysql2';
const jwt = require('jsonwebtoken');
const secretKey = "PEPE_PICA_PAPAS_SECRET"

const generateTokens = (id: number) =>{
  console.log("generateTokens.id: ", id)
  const access_token: string = jwt.sign({ id_user: id }, secretKey, { expiresIn: '1hr' });
  const refresh_token: string = jwt.sign({ id_user: id }, secretKey, { expiresIn: '30d' });
  return { access_token, refresh_token };
}


const findUserByEmail =async  (email: string) => {
  console.log("findUserByEmail.email: ", email)
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows as TUserCreate[]
  console.log("findUserByEmail.user: ", user.length > 0)
  return user.length > 0 ? user[0] : undefined
}


const findUserById =async  (id: number) => {
  console.log("findUserById.id: ", id)
  const [results] = await pool.query('SELECT * FROM users WHERE id_user = ?', [id]);
  const user = results as TUserCreate[]
  console.log("findUserByEmail.exist: ",  user.length > 0)
  return user.length > 0 ? user[0] : undefined
}


export const authenticationToken = async (req: IGetUserAuthInfoRequest, res: Response, next: () => any) => {
  const token = req.headers['authorization']?.split(" ")[1];

  // validate token
  if (!token) return returnError(res, 401)

  try {
    const decoded = jwt.verify(token, secretKey) as { id_user: number }; 

    // validate decoded token
    if (!decoded) return returnError(res, 401)
    
    // validate user exists
    const user = await findUserById(decoded.id_user)

    if (!user) return returnError(res, 401)

    req.user = user
    next();

  } catch (error ) {
    return returnError(res, 401)
  };
}


export const signIn = async (req: Request<{},{}>, res: Response) => {
  console.log("signIn")
  const { email, password } = req.body;

  // validate email and password fields
  if (!email || !password) return returnError(res, 400)

  // validate email format
  if (!validateEmail(email)) return returnError(res, 422)

  // validate password format
  if (!validatePassword(password)) return returnError(res, 423)

  // check if email already exists
  const emailExist = await findUserByEmail(email);
  if (emailExist) return returnError(res, 409)

  try {
    console.log("signIn.hashPassword...")
    const hashedPassword = await hashPassword(password);

    console.log("signIn.pool.creating.user...")
    const [result] = await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]) as OkPacket[];

    console.log("signIn.generateTokens...")
    const userId = result.insertId;
    const tokens = generateTokens(userId);

    console.log("signIn.pool.query.refresh_token...")
    await pool.query('UPDATE users SET refresh_token = ? WHERE id_user = ?', [tokens.refresh_token, userId]);

    const user = await findUserById(userId);
    const {password: _, ...userWithoutPassword} = user as TUserCreate;

    return returnSuccess(res, 200, {
      user: {
        ...userWithoutPassword,
        access_token: tokens.access_token,
      }
    })

  } catch (error) {
    console.error('Error occurred during sign in:', error);
    return  returnError(res, 500)
  };

}

export const login = async (req: Request<{}, {}, TUserAuth>, res: Response) => {
  const { email, password } = req.body;

  // validate email and password fields
  if (!email || !password) return returnError(res, 400)

  try {
    console.log("login.findUserByEmail...")
    const user = await findUserByEmail(email);
    
    // validate user exists
    if (!user) return returnError(res, 401)

    // compare passwords
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) return returnError(res, 401)

    const tokens = generateTokens(user.id_user);

    console.log("login.pool.query.refresh_token...")
    await pool.query('UPDATE users SET refresh_token = ? WHERE id_user = ?', [tokens.refresh_token, user.id_user]);

    const { password: _, ...userWithoutPassword } = user;

    return returnSuccess(res, 200, {
      user: {
        ...userWithoutPassword,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      }
    })


  } catch (error) {
    console.error('Error occurred during login:', error);
    return returnError(res, 500 )
  }
};

export const refreshToken = async (req: IGetUserAuthInfoRequest, res: Response) => {
  const refreshToken = req.headers['authorization']?.split(" ")[1];

  // validate refresh token
  if (!refreshToken) return returnError(res, 401)
   
  // validate refresh token coincides with user's refresh token
  if (refreshToken !== req.user?.refresh_token) return returnError(res, 401)

  try {
    // verify refresh token vs secret key
    const decoded = jwt.verify(refreshToken, secretKey) as { id_user: number };

    // create new refresh token
    const tokens = generateTokens(decoded.id_user);

    // update user's refresh token
    await pool.query('UPDATE users SET refresh_token = ? WHERE id_user = ?', [tokens.refresh_token, decoded.id_user]);

    return returnSuccess(res, 200, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    })
  } catch (error) {
    console.error('Error occurred during token refresh:', error);
    return returnError(res, 500)
  }
};

export const test = async (req: IGetUserAuthInfoRequestWithBody<{}>, res: Response) => {
  return res.status(401).json({ msg: 'test paso perro' });

}