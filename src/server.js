import express from "express";
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

    // TEST USER INJECTION
    app.use((req, res, next) => {
      req.user = {
        id: "d4f7a2b9-3c1e-4f6d-8b2e-91a7c6f5e4d2",
        role: "ADMIN",
      };
      next();
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

    app.get("/", (req, res) => {
      res.send("Hello to BookBase!");
    });

    // BOOK-TYPE ROUTES
    app.post("/book-types", (req, res) =>
      BookTypeController.createBookType(req, res)
    );
    app.get("/book-types", (req, res) =>
      BookTypeController.getBookTypes(req, res)
    );
    app.get("/book-types/id/:id", (req, res) =>
      BookTypeController.getBookTypeById(req, res)
    );
    app.get("/book-types/code/:code", (req, res) =>
      BookTypeController.getBookTypeByCode(req, res)
    );
    app.get("/book-types/name/:name", (req, res) =>
      BookTypeController.getBookTypeByName(req, res)
    );
    app.put("/book-types/:id", (req, res) =>
      BookTypeController.updateBookType(req, res)
    );
    app.delete("/book-types/:id", (req, res) =>
      BookTypeController.deleteBookTypeById(req, res)
    );

    // BOOK-GENRE ROUTES
    app.post("/book-genres", (req, res) =>
      BookGenreController.createBookGenre(req, res)
    );
    app.get("/book-genres", (req, res) =>
      BookGenreController.getBookGenres(req, res)
    );
    app.get("/book-genres/id/:id", (req, res) =>
      BookGenreController.getBookGenreById(req, res)
    );
    app.get("/book-genres/code/:code", (req, res) =>
      BookGenreController.getBookGenreByCode(req, res)
    );
    app.get("/book-genres/name/:name", (req, res) =>
      BookGenreController.getBookGenreByName(req, res)
    );
    app.put("/book-genres/:id", (req, res) =>
      BookGenreController.updateBookGenre(req, res)
    );
    app.delete("/book-genres/:id", (req, res) =>
      BookGenreController.deleteBookGenreById(req, res)
    );

    // BOOK ROUTES
    app.post("/books", upload.single("pdfFile"), (req, res) =>
      BookController.createBook(req, res)
    );
    app.get("/books", (req, res) => BookController.getBooksFiltered(req, res));
    app.get("/books/:id", (req, res) => BookController.getBookById(req, res));
    app.put("/books/:id", (req, res) => BookController.updateBook(req, res));
    app.delete("/books/:id", (req, res) =>
      BookController.deleteBookById(req, res)
    );

    // BOOK-REQUEST ROUTES
    app.post("/book-requests", upload.single("pdfFile"), (req, res) =>
      BookRequestController.createBookRequest(req, res)
    );

    app.get("/book-requests", (req, res) =>
      BookRequestController.getBookRequestsFiltered(req, res)
    );
    app.get("/book-requests/:id", (req, res) =>
      BookRequestController.getBookRequestById(req, res)
    );
    app.put("/book-requests/:id", (req, res) =>
      BookRequestController.updateBookRequest(req, res)
    );
    app.delete("/book-requests/:id", (req, res) =>
      BookRequestController.deleteBookRequestById(req, res)
    );

    // START SERVER
    app.listen(port, () => {
      console.log(`BookBase app listening on port ${port}`);
    });
  }
}

export default Server;
