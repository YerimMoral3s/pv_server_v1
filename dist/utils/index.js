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
exports.returnSuccess = exports.returnError = exports.comparePassword = exports.validatePassword = exports.hashPassword = exports.validateEmail = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const errors_1 = require("./errors");
const validateEmail = (email) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    const isValidEmail = emailRegex.test(email);
    console.log("validateEmail.isValidEmail: ", isValidEmail);
    return isValidEmail;
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
    const MIN_LENGTH = 8; // char min 
    const HAS_UPPERCASE = /[A-Z]/; // at least one uppercase
    const HAS_LOWERCASE = /[a-z]/; // at least one lowercase
    const HAS_NUMBER = /\d/; // at least one number
    const HAS_SPECIAL_CHARACTERS = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/; // at least one special character
    // verify length
    console.log("validatePassword.MIN_LENGTH: ", password.length > MIN_LENGTH);
    if (password.length < MIN_LENGTH)
        return false;
    // verify uppercase
    console.log("validatePassword.HAS_UPPERCASE: ", HAS_UPPERCASE.test(password));
    if (!HAS_UPPERCASE.test(password))
        return false;
    // verify lowercase
    console.log("validatePassword.HAS_LOWERCASE: ", HAS_LOWERCASE.test(password));
    if (!HAS_LOWERCASE.test(password))
        return false;
    // verify number
    console.log("validatePassword.HAS_NUMBER: ", HAS_NUMBER.test(password));
    if (!HAS_NUMBER.test(password))
        return false;
    // verify special characters
    console.log("validatePassword.HAS_SPECIAL_CHARACTERS: ", HAS_SPECIAL_CHARACTERS.test(password));
    if (!HAS_SPECIAL_CHARACTERS.test(password))
        return false;
    return true;
};
exports.validatePassword = validatePassword;
const comparePassword = (password, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("comparePassword.password: ");
    const match = yield bcrypt_1.default.compare(password, hashedPassword);
    return match;
});
exports.comparePassword = comparePassword;
const returnError = (res, status, moreData) => {
    const errorMessage = errors_1.ERROR_MESSAGES[status];
    console.log("returnError.message: ", {
        status,
        message: errorMessage,
        moreData,
    });
    return res.status(status).json({
        status: "error",
        data: Object.assign({ code: status, message: errorMessage }, moreData),
    });
};
exports.returnError = returnError;
const returnSuccess = (res, status, data) => {
    console.log("returnSuccess.message: ", {
        status,
        data
    });
    const response = {
        status: "success",
        data
    };
    return res.status(status).json(response);
};
exports.returnSuccess = returnSuccess;
