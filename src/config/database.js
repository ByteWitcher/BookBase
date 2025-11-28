import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Use SSL only when not in test environment (for cloud databases)
const useSSL = process.env.NODE_ENV !== "test";
const dbUrl = process.env.INTEGRATION_DATABASE_URL || process.env.DATABASE_URL;

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
