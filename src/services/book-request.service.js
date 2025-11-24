import db from "../entities/index.js";
import bookRequestRepository from "../repositories/book-request.repositroy.js";
import bookService from "./book.service.js";
import HttpError from "../utils/http-error.util.js";

const { Book } = db;

class BookRequestService {
  async createBookRequest(data) {
    data.isActive = false;
    const book = await bookService.createBook(data);
    return await bookRequestRepository.create({
      bookId: book.id,
    });
  }

  async getBookRequestById(id) {
    return await bookRequestRepository.findById(id);
  }

  async getBookRequestsFiltered(query) {
    const {
      page = 1,
      pageSize = 10,
      status,
      userId,
      adminId,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = query;

    const limit = +pageSize;
    const offset = (page - 1) * limit;

    // WHERE

    const where = {};

    if (status) {
      where.status = status.toUpperCase();
    }

    if (userId) {
      where.userId = userId;
    }

    if (adminId) {
      where.adminId = adminId;
    }

    // INCLUDE

    const include = [
      {
        model: Book,
        as: "book",
      },
    ];

    // SORTING

    const validSortFields = ["status", "createdAt"];
    const order = [
      [
        validSortFields.includes(sortBy) ? sortBy : "createdAt",
        sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC",
      ],
    ];

    // QUERY

    const { count, rows } = await bookRequestRepository.findFiltered({
      where,
      include,
      limit,
      offset,
      order,
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      pageSize: limit,
      data: rows,
    };
  }

  async updateBookRequest(id, data) {
    const bookRequest = await bookRequestRepository.findById(id);
    if (!bookRequest) throw new HttpError("Book request not found", 404);

    const allowed = ["comment"];
    const updates = {};

    allowed.forEach((field) => {
      if (data[field] !== undefined && data[field] !== bookRequest[field]) {
        updates[field] = data[field];
      }
    });

    if (data.status && bookRequest.status === "PENDING") {
      updates.status = data.status;
      if (updates.status === "APPROVED")
        await bookService.activateBook(bookRequest.bookId);
      else if (updates.status === "REJECTED")
        await bookService.deleteBookById(bookRequest.bookId);
    }

    return await bookRequest.update(updates);
  }

  async updateBookRequestWithBookAttributes(bookRequest, data) {
    data.bookId = null;
    return await bookRequest.update(data);
  }

  async deleteBookRequestById(id) {
    const bookRequest = bookRequestRepository.findById(id);
    if (!bookRequest) throw new HttpError("Book request not found", 404);
    const book = bookService.getBookById(bookRequest.bookId);
    if (book) throw new HttpError("Book still exists", 400);
    return await bookRequestRepository.deleteById(id);
  }
}

export default new BookRequestService();
