import { registerAs } from '@nestjs/config';

export default registerAs('admin', () => ({
  name: process.env.ADMIN_NAME,
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
  ownerEmail: process.env.COMPANY_OWNER_EMAIL,
}));
