"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const promise_1 = require("mysql2/promise");
const dotenv = require('dotenv');
dotenv.config();
const db_host = process.env.db_host;
const db_user = process.env.db_user;
const db_password = process.env.db_password;
const db = process.env.db;
exports.pool = (0, promise_1.createPool)({
    host: db_host,
    user: db_user,
    password: db_password,
    port: 3306,
    database: db
});
