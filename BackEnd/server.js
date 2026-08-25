import app from "./app.js";
import dotenv from 'dotenv';
import { __dirname } from "./app.js";
import prisma from "./Utils/prisma.js";

dotenv.configDotenv({ path: __dirname + '/config.env' });
dotenv.config();

const port = process.env.PORT || 5005;

// تست اتصال به پایگاه داده PostgreSQL
prisma.$connect()
  .then(() => {
    console.log('✅ PostgreSQL database connected successfully via Prisma');
    app.listen(port, () => {
      console.log(`🚀 KA-Platform server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to PostgreSQL database:', err);
    process.exit(1);
  });