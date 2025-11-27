import BookTypeService from "../services/book-type.service.js";

class BookTypeController {
  async createBookType(req, res) {
    try {
      const bookType = await BookTypeService.createBookType(req.body);
      res.status(201).json(bookType);
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async getBookTypeById(req, res) {
    try {
      const bookType = await BookTypeService.getBookTypeById(req.params.id);
      res.status(200).json(bookType);
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async getBookTypeByCode(req, res) {
    try {
      const bookType = await BookTypeService.getBookTypeByCode(req.params.code);
      res.status(200).json(bookType);
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async getBookTypeByName(req, res) {
    try {
      const bookType = await BookTypeService.getBookTypeByName(req.params.name);
      res.status(200).json(bookType);
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async getBookTypes(req, res) {
    try {
      const bookTypes = await BookTypeService.getBookTypes();
      res.status(200).json(bookTypes);
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async updateBookType(req, res) {
    try {
      const bookType = await BookTypeService.updateBookType(
        req.params.id,
        req.body,
      );
      res.status(200).json(bookType);
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async deleteBookTypeById(req, res) {
    try {
      await BookTypeService.deleteBookTypeById(req.params.id);
      res.status(200).json({ message: "Book type deleted successfully" });
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
}

export default new BookTypeController();
