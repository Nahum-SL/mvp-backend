import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('delopment'),

  PORT: Joi.number().default(3001),
  FRONTEND_URL: Joi.string().required(),

  DATABASE_URL: Joi.string().required(),
  DIRECT_URL: Joi.string().required(),

  JWT_SECRET: Joi.string().required(),

  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),

  GA_CLIENT_EMAIL: Joi.string().required(),
  GA_PRIVATE_KEY: Joi.string().required(),
  GA_PROPERTY_ID: Joi.string().required(),

  RESEND_API_KEY: Joi.string().required(),

  ADMIN_EMAIL: Joi.string().email().required(),
  ADMIN_PASSWORD: Joi.string().min(8).required(),

  COMPANY_OWNER_EMAIL: Joi.string().email().required(),
});
