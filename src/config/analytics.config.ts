import { registerAs } from '@nestjs/config';

export default registerAs('analytics', () => ({
  clientEmail: process.env.GA_CLIENT_EMAIL,
  privateKey: process.env.GA_PRIVATE_KEY,
  propertyId: process.env.GA4_PROPERTY_ID,
}));
