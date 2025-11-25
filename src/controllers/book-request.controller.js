import BookRequestService from "../services/book-request.service.js";

class BookRequestController {
  async createBookRequest(req, res) {
    try {
      const data = {
        ...req.body,
        pdfFile: req.file,
      };
      const bookRequest = await BookRequestService.createBookRequest(
        req.user.id,
        data
      );
      res.status(201).json(bookRequest);
    } catch (error) {
      res.status(error.statusCode).json({ message: error.message });
    }
  }

  async getBookRequestById(req, res) {
    try {
      const bookRequest = await BookRequestService.getBookRequestById(
        req.user,
        req.params.id
      );
      res.status(200).json(bookRequest);
    } catch (error) {
      res.status(error.statusCode).json({ message: error.message });
    }
  }

  async getBookRequestsFiltered(req, res) {
    try {
      const result = await BookRequestService.getBookRequestsFiltered(
        req.user,
        req.query
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(error.statusCode).json({ message: error.message });
    }
  }

  async updateBookRequest(req, res) {
    try {
      const bookRequest = await BookRequestService.updateBookRequest(
        req.user.id,
        req.params.id,
        req.body
      );
      res.status(200).json(bookRequest);
    } catch (error) {
      res.status(error.statusCode).json({ message: error.message });
    }
  }

  async deleteBookRequestById(req, res) {
    try {
      await BookRequestService.deleteBookRequestById(req.params.id);
      res.status(200).json({ message: "Book request deleted successfully" });
    } catch (error) {
      res.status(error.statusCode).json({ message: error.message });
    }
  }
}

export default new BookRequestController();
