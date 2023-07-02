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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.validatePassword = exports.hashPassword = exports.validateEmail = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const validateEmail = (email) => {
    // Expresión regular para validar un email
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const saltRounds = 10;
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const salt = yield bcrypt_1.default.genSalt(saltRounds);
    const hashedPassword = yield bcrypt_1.default.hash(password, salt);
    return hashedPassword;
});
exports.hashPassword = hashPassword;
const validatePassword = (password) => {
    const MIN_LENGTH = 8; // Mínimo 8 caracteres
    const HAS_UPPERCASE = /[A-Z]/; // Al menos una mayúscula
    const HAS_LOWERCASE = /[a-z]/; // Al menos una minúscula
    const HAS_NUMBER = /\d/; // Al menos un número
    const HAS_SPECIAL_CHARACTERS = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/; // Al menos un carácter especial
    // Verificar longitud
    if (password.length < MIN_LENGTH) {
        return false;
    }
    // Verificar mayúsculas, minúsculas, números y caracteres especiales
    if (!HAS_UPPERCASE.test(password) ||
        !HAS_LOWERCASE.test(password) ||
        !HAS_NUMBER.test(password) ||
        !HAS_SPECIAL_CHARACTERS.test(password)) {
        return false;
    }
    return true;
};
exports.validatePassword = validatePassword;
const comparePassword = (password, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const match = yield bcrypt_1.default.compare(password, hashedPassword);
    return match;
});
exports.comparePassword = comparePassword;
