"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.test = exports.refreshToken = exports.login = exports.signIn = exports.authenticationToken = void 0;
const db_1 = require("../../db");
const utils_1 = require("../../utils");
const jwt = require('jsonwebtoken');
const secretKey = "PEPE_PICA_PAPAS_SECRET";
const generateTokens = (id) => {
    const accessToken = jwt.sign({ id: id }, secretKey, { expiresIn: '1m' });
    const refreshToken = jwt.sign({ id: id }, secretKey, { expiresIn: '30d' });
    return { accessToken, refreshToken };
};
const findUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows;
    return user.length > 0 ? user[0] : undefined;
});
const findUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const [results] = yield db_1.pool.query('SELECT * FROM users WHERE id = ?', [id]);
    const user = results;
    return user.length > 0 ? user[0] : undefined;
});
const authenticationToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, secretKey);
        if (!decoded) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = yield findUserById(decoded.id);
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: error });
    }
    ;
});
exports.authenticationToken = authenticationToken;
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Missing required parameter' });
    }
    if (!(0, utils_1.validateEmail)(email)) {
        return res.status(422).json({ error: 'Invalid email address' });
    }
    // if (!validatePassword(password)) {
    //   return res.status(400).json({ message: 'The password does not meet the security criteria.' });
    // }
    const email_exist = yield findUserByEmail(email);
    if (email_exist) {
        return res.status(409).json({ message: 'This email already in use' });
    }
    const hashedPassword = yield (0, utils_1.hashPassword)(password);
    const [rows] = yield db_1.pool.query(`INSERT INTO users (email, password) VALUES ('${email}', '${hashedPassword}');`);
    const { refreshToken, accessToken } = generateTokens(rows.insertId);
    yield db_1.pool.query(`UPDATE users SET refreshToken = "${refreshToken}" WHERE id = ${rows.insertId};`);
    const user_id = yield findUserById(rows.insertId);
    return res.status(200).json(Object.assign(Object.assign({}, user_id), { accessToken }));
});
exports.signIn = signIn;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Missing required parameter' });
    }
    if (!(0, utils_1.validateEmail)(email)) {
        return res.status(422).json({ error: 'Invalid email address' });
    }
    const user = yield findUserByEmail(email);
    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }
    const passwordMatch = yield (0, utils_1.comparePassword)(password, user.password);
    if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }
    const { refreshToken, accessToken } = generateTokens(user.id);
    yield db_1.pool.query(`UPDATE users SET refreshToken = "${refreshToken}" WHERE id = ${user.id};`);
    return res.status(200).json(Object.assign(Object.assign({}, user), { refreshToken,
        accessToken }));
});
exports.login = login;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const _refreshToken = (_b = req.headers['authorization']) === null || _b === void 0 ? void 0 : _b.split(" ")[1];
    if (!_refreshToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (_refreshToken !== ((_c = req.user) === null || _c === void 0 ? void 0 : _c.refreshToken)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const decoded = jwt.verify(_refreshToken, secretKey);
    const { accessToken, refreshToken } = generateTokens(decoded.id);
    yield db_1.pool.query(`UPDATE users SET refreshToken = "${refreshToken}" WHERE id = ${decoded.id};`);
    return res.status(200).json({
        refreshToken,
        accessToken
    });
});
exports.refreshToken = refreshToken;
const test = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.user);
    return res.status(401).json({ error: 'test paso perro' });
});
exports.test = test;
