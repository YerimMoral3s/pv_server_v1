import { Request } from "express"
import { TUserCreate } from "../users"

export type TUserAuth = {
  email: string,
  password: string,
}


export interface IGetUserAuthInfoRequest extends Request {
  user?: TUserCreate 
}

export interface IGetUserAuthInfoRequestWithBody<z> extends Request {
  user?: TUserCreate 
  body: z
}