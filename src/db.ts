import {createPool} from "mysql2/promise"

const dotenv = require('dotenv');
dotenv.config();

const db_host = process.env.db_host;
const db_user = process.env.db_user;
const db_password = process.env.db_password;
const db = process.env.db;

export const pool = createPool({
  host: db_host,
  user: db_user,
  password:db_password,
  port: 3306,
  database: db
})


