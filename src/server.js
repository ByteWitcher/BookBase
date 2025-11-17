import express from 'express';
import sequelize from './config/database.js';
import favoriteController from './controllers/favorite.controller.js';
import likeController from './controllers/like.controller.js';
import reviewController from './controllers/review.controller.js';
import authMiddleware from './middlewares/auth.middleware.js';
import User from './entities/user.entity.js';
import Book from './entities/book.entity.js';
import Favorite from './entities/favorite.entity.js';
import Like from './entities/like.entity.js';
import Review from './entities/review.entity.js';

export class Server {
    async listen(port = 3000) {
        const app = express();
        app.use(express.json());
        
        app.get('/', (req, res) => {
            res.send('BookBase API - Favorites, Likes & Reviews');
        });

        // DB CONNECTION TEST
        try {
            await sequelize.authenticate();
            console.log(' Connected to Neon PostgreSQL!');
        } catch (error) {
            console.error(' Database connection failed:', error.message);
            process.exit(1);
        }

        // APPLY ASSOCIATIONS
        const models = { User, Book, Favorite, Like, Review };
        Object.keys(models).forEach((modelName) => {
            if (models[modelName].associate) {
                models[modelName].associate(models);
            }
        });

        // Sync database BEFORE starting server
        try {
            await sequelize.sync({ alter: true });
            console.log(" Database synced successfully.");
        } catch (err) {
            console.error(" Database sync error:", err);
            process.exit(1);
        }

        // FAVORITE ROUTES
        app.post("/books/:id/favorite", authMiddleware, (req, res) => favoriteController.addToFavorites(req, res));
        app.delete("/books/:id/favorite", authMiddleware, (req, res) => favoriteController.removeFromFavorites(req, res));
        app.get("/favorites/me", authMiddleware, (req, res) => favoriteController.getMyFavorites(req, res));

        // LIKE ROUTES
        app.post("/books/:id/like", authMiddleware, (req, res) => likeController.likeBook(req, res));
        app.delete("/books/:id/like", authMiddleware, (req, res) => likeController.unlikeBook(req, res));
        app.get("/books/:id/likes", (req, res) => likeController.getBookLikes(req, res));

        //  REVIEW ROUTES
        app.get("/books/:id/reviews", (req, res) => reviewController.getBookReviews(req, res));
        app.post("/books/:id/reviews", authMiddleware, (req, res) => reviewController.createReview(req, res));
        app.put("/reviews/:reviewId", authMiddleware, (req, res) => reviewController.updateReview(req, res));
        app.delete("/reviews/:reviewId", authMiddleware, (req, res) => reviewController.deleteReview(req, res));
        app.get("/reviews/me", authMiddleware, (req, res) => reviewController.getMyReviews(req, res));

        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    }
}

export default Server;