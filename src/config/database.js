import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

dotenv.config();

// unset SSL when using Dockerized db
const useSsl = process.env.DB_SSL === 'true';
console.log('DB_SSL= ', process.env.DB_SSL);
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
        ssl: useSsl ? { require: true, rejectUnauthorized: false } : undefined,
    }
});

export default sequelize;