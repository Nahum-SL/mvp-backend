import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_URL,
  userDev: process.env.DB_USER_DEV,
  passwordDev: process.env.DB_PASSWORD,
  databaseDev: process.env.DB_NAME,
}));
