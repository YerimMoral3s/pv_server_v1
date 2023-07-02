import bcrypt from 'bcrypt';

export const validateEmail = (email: string): boolean => {
    // Expresión regular para validar un email
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
}

const saltRounds = 10;
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

export const  validatePassword = (password: string): boolean  => {
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
  if (
    !HAS_UPPERCASE.test(password) ||
    !HAS_LOWERCASE.test(password) ||
    !HAS_NUMBER.test(password) ||
    !HAS_SPECIAL_CHARACTERS.test(password)
  ) {
    return false;
  }

  return true;
}

export const comparePassword= async(password: string, hashedPassword: string): Promise<boolean> => { 
  const match = await bcrypt.compare(password, hashedPassword);
  return match;
}