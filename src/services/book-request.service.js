import db from "../entities/index.js";
import bookRequestRepository from "../repositories/book-request.repositroy.js";
import bookService from "./book.service.js";
import HttpError from "../utils/http-error.util.js";

const { Book } = db;

class BookRequestService {
  async createBookRequest(userId, data) {
    data.isActive = false;
    data.adminId = null;
    const book = await bookService.createBook(userId, data);
    const bookRequest = await bookRequestRepository.create({
      bookId: book.id,
      userId,
    });
    bookRequest.book = book;
    return bookRequest;
  }

  async getBookRequestById(user, id) {
    const bookRequest = await bookRequestRepository.findById(id);
    if (!bookRequest) throw new HttpError("Book request not found", 404);
    if (user.role !== "ADMIN" && bookRequest.userId !== user.id)
      throw new HttpError("You are not allowed to view this book request", 403);
    bookRequest.book = await bookRequest.getBook();
    return bookRequest;
  }

  async getBookRequestsFiltered(user, query) {
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

    if (user.role === "USER") {
      where.userId = user.userId;
    } else {
      if (userId) where.userId = userId;
      if (adminId) where.adminId = adminId;
    }

    if (status) {
      where.status = status.toUpperCase();
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

  async updateBookRequest(userId, id, data) {
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
      if (updates.status === "APPROVED") {
        await bookService.activateBook(userId, bookRequest.bookId);
        updates.adminId = userId;
      } else if (updates.status === "REJECTED") {
        await bookService.deleteBookById(bookRequest.bookId);
        updates.adminId = userId;
      }
    }
    await bookRequest.update(updates);
    bookRequest.book = await bookRequest.getBook();
    return bookRequest;
  }

  async updateBookRequestWithBookAttributes(bookRequest, data) {
    data.bookId = null;
    await bookRequest.update(data);
  }

  async deleteBookRequestById(id) {
    const bookRequest = bookRequestRepository.findById(id);
    if (!bookRequest) throw new HttpError("Book request not found", 404);
    const book = bookService.findBookById(bookRequest.bookId);
    if (book) throw new HttpError("Book still exists", 400);
    return await bookRequestRepository.deleteById(id);
  }
}

export default new BookRequestService();
