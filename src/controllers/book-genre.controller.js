import bookGenreService from "../services/book-genre.service";

class BookGenreController {
  async createBookGenre(req, res) {
    try {
      const bookGenre = await bookGenreService.createBookGenre(req.body);
      res.status(201).json(bookGenre);
    } catch (error) {
      res.status(error.statusCode).json({ message: error.message });
    }
  }

  async getBookGenreById(req, res) {
    try {
      const bookGenre = await bookGenreService.getBookGenreById(req.params.id);
      res.status(200).json(bookGenre);
    } catch (error) {
      res.status(error.statusCode).json({ message: error.message });
    }
  }

  async getBookGenreByCode(req, res) {
    try {
      const bookGenre = await bookGenreService.getBookGenreByCode(
        req.params.code
      );
      res.status(200).json(bookGenre);
    } catch (error) {
      res.status(error.statusCode).json({ message: error.message });
    }
  }

  async getBookGenreByName(req, res) {
    try {
      const bookGenre = await bookGenreService.getBookGenreByName(
        req.params.name
      );
      res.status(200).json(bookGenre);
    } catch (error) {
      res.status(error.statusCode).json({ message: error.message });
    }
  }

  async getBookGenres(req, res) {
    try {
      const bookGenres = await bookGenreService.getBookGenres();
      res.status(200).json(bookGenres);
    } catch (error) {
      res.status(error.statusCode).json({ message: error.message });
    }
  }

  async updateBookGenre(req, res) {
    try {
      const bookGenre = await bookGenreService.updateBookGenre(
        req.params.id,
        req.body
      );
      res.status(200).json(bookGenre);
    } catch (error) {
      res.status(error.statusCode).json({ message: error.message });
    }
  }

  async deleteBookGenreById(req, res) {
    try {
      await bookGenreService.deleteBookGenreById(req.params.id);
      res.status(200).json({ message: "Book genre deleted successfully" });
    } catch (error) {
      res.status(error.statusCode).json({ message: error.message });
    }
  }
}

export default new BookGenreController();
