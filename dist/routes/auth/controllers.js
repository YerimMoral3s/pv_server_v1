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
    console.log("generateTokens.id: ", id);
    const access_token = jwt.sign({ id_user: id }, secretKey, { expiresIn: '1hr' });
    const refresh_token = jwt.sign({ id_user: id }, secretKey, { expiresIn: '30d' });
    return { access_token, refresh_token };
};
const findUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("findUserByEmail.email: ", email);
    const [rows] = yield db_1.pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows;
    console.log("findUserByEmail.user: ", user.length > 0);
    return user.length > 0 ? user[0] : undefined;
});
const findUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("findUserById.id: ", id);
    const [results] = yield db_1.pool.query('SELECT * FROM users WHERE id_user = ?', [id]);
    const user = results;
    console.log("findUserByEmail.exist: ", user.length > 0);
    return user.length > 0 ? user[0] : undefined;
});
const authenticationToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    // validate token
    if (!token)
        return (0, utils_1.returnError)(res, 401);
    try {
        const decoded = jwt.verify(token, secretKey);
        // validate decoded token
        if (!decoded)
            return (0, utils_1.returnError)(res, 401);
        // validate user exists
        const user = yield findUserById(decoded.id_user);
        if (!user)
            return (0, utils_1.returnError)(res, 401);
        req.user = user;
        next();
    }
    catch (error) {
        return (0, utils_1.returnError)(res, 401);
    }
    ;
});
exports.authenticationToken = authenticationToken;
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("signIn");
    const { email, password } = req.body;
    // validate email and password fields
    if (!email || !password)
        return (0, utils_1.returnError)(res, 400);
    // validate email format
    if (!(0, utils_1.validateEmail)(email))
        return (0, utils_1.returnError)(res, 422);
    // validate password format
    if (!(0, utils_1.validatePassword)(password))
        return (0, utils_1.returnError)(res, 423);
    // check if email already exists
    const emailExist = yield findUserByEmail(email);
    if (emailExist)
        return (0, utils_1.returnError)(res, 409);
    try {
        console.log("signIn.hashPassword...");
        const hashedPassword = yield (0, utils_1.hashPassword)(password);
        console.log("signIn.pool.creating.user...");
        const [result] = yield db_1.pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
        console.log("signIn.generateTokens...");
        const userId = result.insertId;
        const tokens = generateTokens(userId);
        console.log("signIn.pool.query.refresh_token...");
        yield db_1.pool.query('UPDATE users SET refresh_token = ? WHERE id_user = ?', [tokens.refresh_token, userId]);
        const user = yield findUserById(userId);
        const _b = user, { password: _ } = _b, userWithoutPassword = __rest(_b, ["password"]);
        return (0, utils_1.returnSuccess)(res, 200, {
            user: Object.assign(Object.assign({}, userWithoutPassword), { access_token: tokens.access_token })
        });
    }
    catch (error) {
        console.error('Error occurred during sign in:', error);
        return (0, utils_1.returnError)(res, 500);
    }
    ;
});
exports.signIn = signIn;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    // validate email and password fields
    if (!email || !password)
        return (0, utils_1.returnError)(res, 400);
    try {
        console.log("login.findUserByEmail...");
        const user = yield findUserByEmail(email);
        // validate user exists
        if (!user)
            return (0, utils_1.returnError)(res, 401);
        // compare passwords
        const passwordMatch = yield (0, utils_1.comparePassword)(password, user.password);
        if (!passwordMatch)
            return (0, utils_1.returnError)(res, 401);
        const tokens = generateTokens(user.id_user);
        console.log("login.pool.query.refresh_token...");
        yield db_1.pool.query('UPDATE users SET refresh_token = ? WHERE id_user = ?', [tokens.refresh_token, user.id_user]);
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        return (0, utils_1.returnSuccess)(res, 200, {
            user: Object.assign(Object.assign({}, userWithoutPassword), { access_token: tokens.access_token, refresh_token: tokens.refresh_token })
        });
    }
    catch (error) {
        console.error('Error occurred during login:', error);
        return (0, utils_1.returnError)(res, 500);
    }
});
exports.login = login;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const refreshToken = (_c = req.headers['authorization']) === null || _c === void 0 ? void 0 : _c.split(" ")[1];
    // validate refresh token
    if (!refreshToken)
        return (0, utils_1.returnError)(res, 401);
    // validate refresh token coincides with user's refresh token
    if (refreshToken !== ((_d = req.user) === null || _d === void 0 ? void 0 : _d.refresh_token))
        return (0, utils_1.returnError)(res, 401);
    try {
        // verify refresh token vs secret key
        const decoded = jwt.verify(refreshToken, secretKey);
        // create new refresh token
        const tokens = generateTokens(decoded.id_user);
        // update user's refresh token
        yield db_1.pool.query('UPDATE users SET refresh_token = ? WHERE id_user = ?', [tokens.refresh_token, decoded.id_user]);
        return (0, utils_1.returnSuccess)(res, 200, {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
        });
    }
    catch (error) {
        console.error('Error occurred during token refresh:', error);
        return (0, utils_1.returnError)(res, 500);
    }
});
exports.refreshToken = refreshToken;
const test = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(401).json({ msg: 'test paso perro' });
});
exports.test = test;
