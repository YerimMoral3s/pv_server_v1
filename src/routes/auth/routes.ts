import express from 'express';
import { authenticationToken, login, refreshToken, signIn, test  } from "./controllers";

export const authRouter = express.Router();

authRouter.get('/test', authenticationToken ,test);
authRouter.get('/refresh-token', authenticationToken, refreshToken);
authRouter.get('/', login );
authRouter.post('/', signIn );




