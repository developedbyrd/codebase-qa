import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT,
  mongoDBUri: process.env.MONGODB_URI,
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  appUrl: process.env.APP_URL,
};