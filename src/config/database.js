import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Use SSL only when not in test environment (for cloud databases)
const useSSL = process.env.NODE_ENV !== "test";

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: useSSL
    ? {
        ssl: { require: true, rejectUnauthorized: false },
      }
    : {},
});

export default sequelize;
