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
    let bookRequest = await bookRequestRepository.create({
      bookId: book.id,
      userId,
    });
    bookRequest = bookRequest.toJSON();
    bookRequest.book = book;
    return bookRequest;
  }

  async getBookRequestById(user, id) {
    const bookRequest = await bookRequestRepository.findById(id);
    if (!bookRequest) throw new HttpError(404, "Book request not found");
    if (user.role !== "ADMIN" && bookRequest.userId !== user.id)
      throw new HttpError(403, "You are not allowed to view this book request");
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
    if (!bookRequest) throw new HttpError(404, "Book request not found");

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
    return bookRequest;
  }

  async updateBookRequestWithBookAttributes(bookRequest, data) {
    data.bookId = null;
    await bookRequest.update(data);
  }

  async deleteBookRequestById(id) {
    const bookRequest = await bookRequestRepository.findById(id);
    if (!bookRequest) throw new HttpError(404, "Book request not found");
    if (bookRequest.bookId !== null)
      throw new HttpError(400, "Book still exists");
    return await bookRequestRepository.deleteById(id);
  }
}

export default new BookRequestService();
