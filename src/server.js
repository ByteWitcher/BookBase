import express from "express";
import sequelize from "./config/database.js";

export class Server {
  async listen(port = 3000) {
    const app = express();

    app.use(express.json());

    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    // DB CONNECTION TEST
    try {
      await sequelize.authenticate();
      console.log("Connected to Neon PostgreSQL!");
    } catch (error) {
      console.error("Database connection failed:", error.message);
      process.exit(1);
    }

    // Sync database BEFORE starting server
    try {
      await sequelize.sync();
      console.log("Database synced successfully.");
    } catch (err) {
      console.error("Database sync error:", err);
      process.exit(1);
    }
  }
}

export default Server;
