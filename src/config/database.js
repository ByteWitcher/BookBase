import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.INTEGRATION_DATABASE_URL || process.env.DATABASE_URL;
const useSSL = !process.env.INTEGRATION_DATABASE_URL;

const sequelize = new Sequelize(dbUrl, {
  dialect: "postgres",
  logging: false,
  dialectOptions: useSSL
    ? {
        ssl: { require: true, rejectUnauthorized: false },
      }
    : {},
});

export default sequelize;
