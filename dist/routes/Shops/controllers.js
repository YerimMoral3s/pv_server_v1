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
exports.getUserShop = exports.postUserShop = exports.findShopByName = void 0;
const db_1 = require("../../db");
const findShopByName = (name) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.pool.query(`SELECT * from shops WHERE name='${name}'`);
    return result;
});
exports.findShopByName = findShopByName;
// export const postUserShop = async (req: Request<TShop>, res: Response) => {
const postUserShop = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { body, user } = req;
    const { name, logo } = body;
    if (!name) {
        return res.status(400).json({ status: "error", message: 'name is required' });
    }
    const shopExist = yield (0, exports.findShopByName)(name);
    if (shopExist.length) {
        return res.status(400).json({ status: "error", message: 'shop already exist' });
    }
    const [result] = yield db_1.pool.query('INSERT INTO shops (name, logo, id_user) VALUES (?, ?, ?)', [name, logo, user === null || user === void 0 ? void 0 : user.id]);
    if (result.insertId) {
        return res.status(201).json({
            status: 'success',
            data: {
                shop: {
                    id: result.insertId,
                    name,
                    logo,
                }
            }
        });
    }
});
exports.postUserShop = postUserShop;
const getUserShop = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { params } = req;
    const id = params.id;
    const [result] = yield db_1.pool.query(`SELECT * from shops WHERE id=${id}`);
    res.send(`¡Hola desde getUserShop !`);
});
exports.getUserShop = getUserShop;
