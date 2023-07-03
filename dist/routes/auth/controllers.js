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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
        return res.status(401).json({ error: 'Unauthorized', message: "Token expired" });
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
    const emailExist = yield findUserByEmail(email);
    if (emailExist) {
        return res.status(409).json({ message: 'This email is already in use' });
    }
    try {
        const hashedPassword = yield (0, utils_1.hashPassword)(password);
        const [result] = yield db_1.pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
        const userId = result.insertId;
        const { refreshToken, accessToken } = generateTokens(userId);
        yield db_1.pool.query('UPDATE users SET refreshToken = ? WHERE id = ?', [refreshToken, userId]);
        const user = yield findUserById(userId);
        const _b = user, { password: _ } = _b, userWithoutPassword = __rest(_b, ["password"]);
        return res.status(200).json(Object.assign(Object.assign({}, userWithoutPassword), { accessToken }));
    }
    catch (error) {
        console.error('Error occurred during sign in:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
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
    try {
        const user = yield findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const passwordMatch = yield (0, utils_1.comparePassword)(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const { refreshToken, accessToken } = generateTokens(user.id);
        yield db_1.pool.query('UPDATE users SET refreshToken = ? WHERE id = ?', [refreshToken, user.id]);
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        return res.status(200).json(Object.assign(Object.assign({}, userWithoutPassword), { refreshToken,
            accessToken }));
    }
    catch (error) {
        console.error('Error occurred during login:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.login = login;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const refreshToken = (_c = req.headers['authorization']) === null || _c === void 0 ? void 0 : _c.split(" ")[1];
    if (!refreshToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (refreshToken !== ((_d = req.user) === null || _d === void 0 ? void 0 : _d.refreshToken)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(refreshToken, secretKey);
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.id);
        yield db_1.pool.query('UPDATE users SET refreshToken = ? WHERE id = ?', [newRefreshToken, decoded.id]);
        return res.status(200).json({
            refreshToken: newRefreshToken,
            accessToken
        });
    }
    catch (error) {
        console.error('Error occurred during token refresh:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.refreshToken = refreshToken;
const test = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(401).json({ msg: 'test paso perro' });
});
exports.test = test;
