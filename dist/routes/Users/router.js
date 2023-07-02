"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = __importDefault(require("express"));
const controllers_1 = require("./controllers");
exports.usersRouter = express_1.default.Router();
exports.usersRouter.post('/:id', controllers_1.register);
