import { Request } from "express"
import { TUser } from "../users"

export type TUserAuth = {
  email: string,
  password: string,
}


export interface IGetUserAuthInfoRequest extends Request {
  user?: TUser 
}

export interface IGetUserAuthInfoRequestWithBody<z> extends Request {
  user?: TUser 
  body: z
}