import * as dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT secret not specified');
}

const PASSWORD_SECRET = process.env.PASSWORD_SECRET;
if (!PASSWORD_SECRET) {
  throw new Error('PASSWORD_SECRET secret not specified');
}

const PORT = process.env.PORT || 3306;

const COOKIE_LIFETIME = process.env.COOKIE_LIFETIME;
if (!COOKIE_LIFETIME) {
  throw new Error('COOKIE_LIFETIME not specified');
}

const COOKIE_LIFETIME_NUMBER = Number(COOKIE_LIFETIME);

const TOKEN_LIFETIME = process.env.TOKEN_LIFETIME;
if (!TOKEN_LIFETIME) {
  throw new Error('TOKEN_LIFETIME not set');
}

export {
  JWT_SECRET,
  PASSWORD_SECRET,
  PORT,
  TOKEN_LIFETIME,
  COOKIE_LIFETIME_NUMBER,
};
