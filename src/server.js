import express from 'express';
import sequelize from './config/database.js';

import favoriteController from './controllers/favorite.controller.js';
import likeController from './controllers/like.controller.js';
import reviewController from './controllers/review.controller.js';

import User from './entities/user.entity.js';
import Book from './entities/book.entity.js';
import Review from './entities/review.entity.js';

export class Server {
    async listen(port = 3000) {
        const app = express();
        app.use(express.json());


        app.get('/', (req, res) => {
            res.send('BookBase API - Favorites, Likes & Reviews');
        });

        // DATABASE CONNECTION
        try {
            await sequelize.authenticate();
            console.log(' Connected to Neon PostgreSQL!');
        } catch (error) {
            console.error(' Database connection failed:', error.message);
            process.exit(1);
        }

        // APPLY ASSOCIATIONS
        const models = { User, Book, Review };
        Object.values(models).forEach((model) => {
            if (model.associate) {
                model.associate(models);
            }
        });

        // SYNC DATABASE
        try {
            await sequelize.sync({ alter: true });
            console.log(" Database synced successfully.");
        } catch (err) {
            console.error(" Database sync error:", err);
            process.exit(1);
        }

        // FAVORITE ROUTES
        app.post("/books/:id/favorite", (req, res) => favoriteController.addToFavorites(req, res));
        app.delete("/books/:id/favorite", (req, res) => favoriteController.removeFromFavorites(req, res));
        app.get("/favorites/me", (req, res) => favoriteController.getMyFavorites(req, res));

        // LIKE ROUTES
        app.post("/books/:id/like", (req, res) => likeController.likeBook(req, res));
        app.get("/books/:id/likes", (req, res) => likeController.getBookLikes(req, res));

        // REVIEW ROUTES
        app.get("/books/:id/reviews", (req, res) => reviewController.getBookReviews(req, res));
        app.post("/books/:id/reviews", (req, res) => reviewController.createReview(req, res));
        app.put("/reviews/:reviewId", (req, res) => reviewController.updateReview(req, res));
        app.delete("/reviews/:reviewId", (req, res) => reviewController.deleteReview(req, res));
        app.get("/reviews/me", (req, res) => reviewController.getMyReviews(req, res));

        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    }
}

export default Server;
