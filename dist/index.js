"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
const dotenv = require('dotenv');
dotenv.config();
const app = (0, express_1.default)();
const mainPort = process.env.mainPort;
app.get('/', (req, res) => {
    res.send('HELLO WORLD');
});
app.use(express_1.default.json());
app.use('/auth', routes_1.authRouter);
// app.use("/shops", shopsRouter);
app.listen(mainPort, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${mainPort}`);
});
