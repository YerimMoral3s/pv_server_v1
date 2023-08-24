import bcrypt from 'bcrypt';
import { Response } from 'express';
import {  ERROR_MESSAGES, Terrors } from './errors';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  const isValidEmail = emailRegex.test(email);
  console.log("validateEmail.isValidEmail: ", isValidEmail)
  return isValidEmail;
}

const saltRounds = 10;
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

export const  validatePassword = (password: string): boolean  => {
  const MIN_LENGTH = 8; // char min 
  const HAS_UPPERCASE = /[A-Z]/; // at least one uppercase
  const HAS_LOWERCASE = /[a-z]/; // at least one lowercase
  const HAS_NUMBER = /\d/; // at least one number
  const HAS_SPECIAL_CHARACTERS = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/; // at least one special character
  
  // verify length
  console.log("validatePassword.MIN_LENGTH: ", password.length > MIN_LENGTH)
  if (password.length < MIN_LENGTH) return false;

  // verify uppercase
  console.log("validatePassword.HAS_UPPERCASE: ", HAS_UPPERCASE.test(password))
  if (!HAS_UPPERCASE.test(password)) return false;

  // verify lowercase
  console.log("validatePassword.HAS_LOWERCASE: ", HAS_LOWERCASE.test(password))
  if (!HAS_LOWERCASE.test(password)) return false;

  // verify number
  console.log("validatePassword.HAS_NUMBER: ", HAS_NUMBER.test(password))
  if (!HAS_NUMBER.test(password)) return false;

  // verify special characters
  console.log("validatePassword.HAS_SPECIAL_CHARACTERS: ", HAS_SPECIAL_CHARACTERS.test(password))
  if (!HAS_SPECIAL_CHARACTERS.test(password)) return false;

  return true;
}

export const comparePassword= async(password: string, hashedPassword: string): Promise<boolean> => { 
  console.log("comparePassword.password: ")
  const match = await bcrypt.compare(password, hashedPassword);
  return match;
}

export const returnError = (res: Response, status: Terrors, moreData?: Record<string, any>) => {
  const errorMessage = ERROR_MESSAGES[status];

  console.log("returnError.message: ", {
    status,
    message: errorMessage,
    moreData,
  });

  return res.status(status).json({
    status: "error",
    data: {
      code: status,
      message: errorMessage,
      ...moreData,
    },
  });
};


export const returnSuccess = <T>(res: Response, status: number, data: T) => {
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
