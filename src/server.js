import express from 'express';
import authController from './controllers/auth.controller.js';
import userController from './controllers/user.controller.js';
import authMiddleware from './middlewares/auth.middleware.js';
import requireAdmin from './middlewares/role.middleware.js';
import sequelize from './config/database.js';

export class Server {

    async listen(port = 3000) {
        const app = express();

        app.use(express.json());
        
        app.get('/', (req, res) => {
            res.send('Hello World!');
        })

        // DB CONNECTION TEST
        try {
            await sequelize.authenticate();
            console.log('Connected to Neon PostgreSQL!');
        } catch (error) {
            console.error('Database connection failed:', error.message);
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

        // AUTH CONTROLLER
        app.post("/auth/register", (req, res) => authController.register(req, res));
        app.post("/auth/login", (req, res) => authController.login(req, res));
        app.post("/auth/reset-password", (req, res) => authController.resetPassword(req, res));

        // USER CONTROLLER
        app.get("/users", authMiddleware, (req, res) => userController.getUsers(req, res));
        app.get("/users/id/:id", authMiddleware, requireAdmin, (req, res) => userController.getUserById(req, res));
        app.get("/users/email/:email", authMiddleware, requireAdmin, (req, res) => userController.getUserByEmail(req, res));
        app.get("/users/username/:username", authMiddleware, requireAdmin, (req, res) => userController.getUserByUsername(req, res));

        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`)
        });
    }
}

export default Server;