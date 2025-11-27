import BookService from "../services/book.service.js";

class BookController {
  async createBook(req, res) {
    try {
      const data = {
        ...req.body,
        pdfFile: req.file,
      };
      const book = await BookService.createBook(req.user.id, data);
      res.status(201).json(book);
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async getBookById(req, res) {
    try {
      const book = await BookService.getBookById(req.params.id);
      res.status(200).json(book);
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async getBooksFiltered(req, res) {
    try {
      const result = await BookService.getBooksFiltered(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async updateBook(req, res) {
    try {
      const book = await BookService.updateBook(req.params.id, req.body);
      res.status(200).json(book);
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async deleteBookById(req, res) {
    try {
      await BookService.deleteBookById(req.params.id);
      res.status(200).json({ message: "Book deleted successfully" });
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
}

export default new BookController();
