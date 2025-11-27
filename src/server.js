import WeeklyReadingSummaryController from "./controllers/weeklyReadingSummary.controller.js";
import ReadingAchievementController from "./controllers/readingAchievement.controller.js";
import ReadingSessionController from "./controllers/readingSession.controller.js";
import express from "express";
import authController from "./controllers/auth.controller.js";
import userController from "./controllers/user.controller.js";
import authMiddleware from "./middlewares/auth.middleware.js";
import requireAdmin from "./middlewares/role.middleware.js";
import sequelize from "./config/database.js";
import upload from "./utils/file-uploader.util.js";
import BookTypeController from "./controllers/book-type.controller.js";
import BookGenreController from "./controllers/book-genre.controller.js";
import BookController from "./controllers/book.controller.js";
import BookRequestController from "./controllers/book-request.controller.js";

export class Server {
  async listen(port = 3000) {
    const app = express();

    app.use(express.json());

    app.get("/", (req, res) => {
      res.send("Hello from BookBase!");
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

    // AUTH CONTROLLER
    app.post("/auth/register", (req, res) => authController.register(req, res));
    app.post("/auth/login", (req, res) => authController.login(req, res));
    app.post("/auth/reset-password", (req, res) =>
      authController.resetPassword(req, res),
    );

    // USER CONTROLLER
    app.get("/users/me", authMiddleware, (req, res) =>
      userController.getMe(req, res),
    );
    app.get("/users/id/:id", authMiddleware, requireAdmin, (req, res) =>
      userController.getUserById(req, res),
    );
    app.get("/users/email/:email", authMiddleware, requireAdmin, (req, res) =>
      userController.getUserByEmail(req, res),
    );
    app.get(
      "/users/username/:username",
      authMiddleware,
      requireAdmin,
      (req, res) => userController.getUserByUsername(req, res),
    );
    app.get("/users", authMiddleware, (req, res) =>
      userController.getUsers(req, res),
    );
    app.put("/users/me/update", authMiddleware, (req, res) =>
      userController.updateMe(req, res),
    );
    app.put(
      "/users/username/:username/update",
      authMiddleware,
      requireAdmin,
      (req, res) => userController.updateUser(req, res),
    );
    app.delete("/users/me/delete", authMiddleware, (req, res) =>
      userController.deleteMe(req, res),
    );
    app.delete(
      "/users/username/:username/delete",
      authMiddleware,
      requireAdmin,
      (req, res) => userController.deleteUser(req, res),
    );

    // BOOK-TYPE ROUTES
    app.post("/book-types", authMiddleware,requireAdmin, (req, res) =>
      BookTypeController.createBookType(req, res),
    );
    app.get("/book-types", authMiddleware, (req, res) =>
      BookTypeController.getBookTypes(req, res),
    );
    app.get("/book-types/id/:id", authMiddleware, (req, res) =>
      BookTypeController.getBookTypeById(req, res),
    );
    app.get("/book-types/code/:code", authMiddleware, (req, res) =>
      BookTypeController.getBookTypeByCode(req, res),
    );
    app.get("/book-types/name/:name", authMiddleware, (req, res) =>
      BookTypeController.getBookTypeByName(req, res),
    );
    app.put("/book-types/:id", authMiddleware, requireAdmin,(req, res) =>
      BookTypeController.updateBookType(req, res),
    );
    app.delete("/book-types/:id", authMiddleware, requireAdmin, (req, res) =>
      BookTypeController.deleteBookTypeById(req, res),
    );

    // BOOK-GENRE ROUTES
    app.post("/book-genres", authMiddleware,requireAdmin, (req, res) =>
      BookGenreController.createBookGenre(req, res),
    );
    app.get("/book-genres", authMiddleware, (req, res) =>
      BookGenreController.getBookGenres(req, res),
    );
    app.get("/book-genres/id/:id", authMiddleware, (req, res) =>
      BookGenreController.getBookGenreById(req, res),
    );
    app.get("/book-genres/code/:code", authMiddleware, (req, res) =>
      BookGenreController.getBookGenreByCode(req, res),
    );
    app.get("/book-genres/name/:name", authMiddleware, (req, res) =>
      BookGenreController.getBookGenreByName(req, res),
    );
    app.put("/book-genres/:id", authMiddleware,requireAdmin, (req, res) =>
      BookGenreController.updateBookGenre(req, res),
    );
    app.delete("/book-genres/:id", authMiddleware, requireAdmin, (req, res) =>
      BookGenreController.deleteBookGenreById(req, res),
    );

    // BOOK ROUTES
    app.post("/books",authMiddleware,requireAdmin, upload.single("pdfFile"), (req, res) =>
      BookController.createBook(req, res),
    );
    app.get("/books", authMiddleware, (req, res) => BookController.getBooksFiltered(req, res));
    app.get("/books/:id", authMiddleware, (req, res) => BookController.getBookById(req, res));
    app.put("/books/:id", authMiddleware,requireAdmin, (req, res) => BookController.updateBook(req, res));
    app.delete("/books/:id", authMiddleware, requireAdmin, (req, res) =>
      BookController.deleteBookById(req, res),
    );

    // BOOK-REQUEST ROUTES
    app.post("/book-requests",authMiddleware, upload.single("pdfFile"), (req, res) =>
      BookRequestController.createBookRequest(req, res),
    );

    app.get("/book-requests", authMiddleware, (req, res) =>
      BookRequestController.getBookRequestsFiltered(req, res),
    );
    app.get("/book-requests/:id", authMiddleware, (req, res) =>
      BookRequestController.getBookRequestById(req, res),
    );
    app.put("/book-requests/:id", authMiddleware,requireAdmin, (req, res) =>
      BookRequestController.updateBookRequest(req, res),
    );
    app.delete("/book-requests/:id", authMiddleware, requireAdmin, (req, res) =>
      BookRequestController.deleteBookRequestById(req, res),
    );

    // READING SESSION ROUTES
    // Leaderboard (public)
    app.get("/reading-sessions/leaderboard", (req, res) => ReadingSessionController.getLeaderboard(req, res));
    
    app.post("/reading-sessions", authMiddleware, (req, res) => ReadingSessionController.createSession(req, res));
    app.get("/reading-sessions/:id", authMiddleware, (req, res) => ReadingSessionController.getSessionById(req, res));
    app.put("/reading-sessions/:id", authMiddleware, (req, res) => ReadingSessionController.updateSession(req, res));
    app.delete("/reading-sessions/:id", authMiddleware, (req, res) => ReadingSessionController.deleteSession(req, res));

    app.get("/reading-sessions/user/:userId", authMiddleware, requireAdmin, (req, res) => ReadingSessionController.getAllSessionsByUser(req, res));
    app.get("/reading-sessions/user/:userId/book/:bookId/latest", authMiddleware, requireAdmin, (req, res) => ReadingSessionController.getLatestSessionByUserAndBook(req, res));
    app.get("/reading-sessions/user/:userId/progress", authMiddleware, requireAdmin, (req, res) => ReadingSessionController.getUserBookProgress(req, res));

    // Convenience endpoints for authenticated user
    app.get("/reading-sessions/me", authMiddleware, (req, res) => ReadingSessionController.getMySessions(req, res));
    app.get("/reading-sessions/me/progress", authMiddleware, (req, res) => ReadingSessionController.getMyBookProgress(req, res));

    // READING ACHIEVEMENT ROUTES
    app.get("/reading-achievements", authMiddleware, requireAdmin, (req, res) => ReadingAchievementController.getAchievements(req, res));
    app.get("/reading-achievements/:id", authMiddleware, requireAdmin, (req, res) => ReadingAchievementController.getAchievementById(req, res));
    app.delete("/reading-achievements/:id", authMiddleware, requireAdmin, (req, res) => ReadingAchievementController.deleteAchievement(req, res));
    app.get("/reading-achievements/me", authMiddleware, (req, res) => ReadingAchievementController.getMyAchievements(req, res));

    // WEEKLY READING SUMMARY ROUTES
    // Admin: Generate current week's summaries for all users
    app.post("/weekly-summaries/generate-current-week", authMiddleware, requireAdmin, (req, res) => WeeklyReadingSummaryController.generateCurrentWeekSummariesForAllUsers(req, res));

    // Authenticated user: Get/generate current week's summary
    app.get("/weekly-summaries/me/current-week", authMiddleware, (req, res) => WeeklyReadingSummaryController.getMyCurrentWeekSummary(req, res));

    app.get("/weekly-summaries/me", authMiddleware, (req, res) => WeeklyReadingSummaryController.getMyWeeklySummaries(req, res));
    app.post("/weekly-summaries/user/current-week", authMiddleware, requireAdmin, (req, res) => WeeklyReadingSummaryController.getUserCurrentWeekSummary(req, res));

    app.post("/weekly-summaries/user/all", authMiddleware, requireAdmin, (req, res) => WeeklyReadingSummaryController.getUserWeeklySummaries(req, res));

    // Admin: Get all weekly summaries (with filtering, sorting, pagination)
    app.get("/weekly-summaries", authMiddleware, requireAdmin, (req, res) => WeeklyReadingSummaryController.getAllSummaries(req, res));
    app.delete("/weekly-summaries/:id", authMiddleware, requireAdmin, (req, res) => WeeklyReadingSummaryController.deleteSummary(req, res));

    // START SERVER
    app.listen(port, () => {
      console.log(`BookBase app listening on port ${port}`);
    });
  }
}

export default Server;
