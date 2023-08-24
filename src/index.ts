import express, {Express, Request, Response} from 'express';
import { authRouter, shopsRouter } from './routes';


const dotenv = require('dotenv');


dotenv.config();

const app: Express = express();
const mainPort = process.env.mainPort;


app.get('/', (req: Request, res: Response) => {
  res.send('HELLO WORLD');
});

app.use(express.json())


app.use('/auth', authRouter);
// app.use("/shops", shopsRouter);


app.listen(mainPort, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${mainPort}`);
});
