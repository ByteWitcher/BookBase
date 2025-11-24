import bookRepository from "../repositories/book.repository";
import bookTypeService from "./book-type.service";
import bookGenreService from "./book-genre.service";
import bookRequestService from "./book-request.service";
import crypto from "crypto";
import { Op } from "sequelize";
import db from "../entities/index.js";
import HttpError from "../utils/http-error.util";

const { BookType, BookGenre } = db;

class BookService {
  async createBook(userId, data) {
    const { bookGenreIds, ...bookData } = data;

    const fingerprint = this._buildBookFingerprint(bookData);

    const existingFingerprint = await bookRepository.findByFingerprint(
      fingerprint
    );
    if (existingFingerprint) {
      if (existingFingerprint.isActive)
        throw new HttpError("Book already exists", 400);
      else
        throw new HttpError(
          "Book already submitted and is pending approval",
          400
        );
    }

    const existingBookType = await bookTypeService.getBookTypeById(
      bookData.bookTypeId
    );
    if (!existingBookType) throw new HttpError("Book type not found", 404);

    const existingBookGenres = await bookGenreService.getBookGenresByIds(
      bookGenreIds
    );

    if (existingBookGenres.length !== bookGenreIds.length)
      throw new HttpError("One or more book genres are not found", 404);

    // add s3PdfUrl later
    const book = await bookRepository.create({
      ...bookData,
      fingerprint,
      isActive: bookData.isActive !== undefined ? bookData.isActive : true,
      userId,
      adminId: userId,
    });

    await book.setBookGenres(bookGenreIds);
    return book;
  }

  async getBookById(id) {
    return await bookRepository.findById(id);
  }

  async getBooksFiltered(query) {
    const {
      page = 1,
      pageSize = 10,
      title,
      authors,
      edition,
      languageCode,
      bookTypeId,
      userId,
      adminId,
      bookGenreIds,
      startDate,
      endDate,
      minPages,
      maxPages,
      minLikes,
      maxLikes,
      minRating,
      maxRating,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = query;

    const limit = +pageSize;
    const offset = (page - 1) * limit;

    // WHERE

    const where = {};

    if (title) {
      where.title = { [Op.iLike]: `%${title}%` };
    }

    if (authors) {
      where.authors = {
        [Op.overlap]: Array.isArray(authors) ? authors : [authors],
      };
    }

    if (edition) {
      where.edition = { [Op.iLike]: `%${edition}%` };
    }

    if (languageCode) {
      where.languageCode = languageCode;
    }

    if (bookTypeId) {
      where.bookTypeId = bookTypeId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (adminId) {
      where.adminId = adminId;
    }

    if (startDate || endDate) {
      where.releaseDate = {};
      if (startDate) where.releaseDate[Op.gte] = new Date(startDate);
      if (endDate) where.releaseDate[Op.lte] = new Date(endDate);
    }

    if (minPages || maxPages) {
      where.pageCount = {};
      if (minPages) where.pageCount[Op.gte] = Number(minPages);
      if (maxPages) where.pageCount[Op.lte] = Number(maxPages);
    }

    if (minLikes || maxLikes) {
      where.likes = {};
      if (minLikes) where.likes[Op.gte] = Number(minLikes);
      if (maxLikes) where.likes[Op.lte] = Number(maxLikes);
    }

    if (minRating || maxRating) {
      where.rating = {};
      if (minRating) where.rating[Op.gte] = Number(minRating);
      if (maxRating) where.rating[Op.lte] = Number(maxRating);
    }

    // INCLUDE

    const include = [
      {
        model: BookGenre,
        as: "bookGenres",
        ...(bookGenreIds && {
          where: {
            id: {
              [Op.in]: Array.isArray(bookGenreIds)
                ? bookGenreIds
                : [bookGenreIds],
            },
          },
          required: true,
        }),
      },
      {
        model: BookType,
        as: "bookType",
      },
    ];

    // SORTING

    const validSortFields = [
      "title",
      "releaseDate",
      "pageCount",
      "likes",
      "rating",
      "createdAt",
    ];

    const order = [
      [
        validSortFields.includes(sortBy) ? sortBy : "createdAt",
        sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC",
      ],
    ];

    // QUERY

    const { count, rows } = await bookRepository.findFiltered({
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

  async countBooksByBookTypeId(bookTypeId) {
    return await bookRepository.countByBookTypeId(bookTypeId);
  }

  async countBooksByBookGenreId(bookGenreId) {
    return await bookRepository.countByBookGenreId(bookGenreId);
  }

  async updateBook(id, data) {
    const book = await bookRepository.findById(id);
    if (!book) throw new HttpError("Book not found", 404);
    const { bookGenreIds, ...bookData } = data;
    const allowed = [
      "title",
      "authors",
      "edition",
      "description",
      "languageCode",
      "releaseDate",
      "pageCount",
      "s3PdfUrl",
      "bookTypeId",
    ];
    const updates = {};

    allowed.forEach((field) => {
      if (bookData[field] !== undefined && bookData[field] !== book[field]) {
        updates[field] = bookData[field];
      }
    });

    if (updates.bookTypeId !== undefined) {
      const existingBookType = await bookTypeService.getBookTypeById(
        updates.bookTypeId
      );
      if (!existingBookType) throw new HttpError("Book type not found", 404);
    }

    if (bookGenreIds !== undefined) {
      const existingBookGenres = await bookGenreService.getBookGenresByIds(
        bookGenreIds
      );

      if (existingBookGenres.length !== bookGenreIds.length)
        throw new HttpError("One or more book genres are not found", 404);
    }

    Object.assign(book, updates);
    const fingerprint = this._buildBookFingerprint(book);
    const existingFingerprint = await bookRepository.findByFingerprint(
      fingerprint
    );
    if (existingFingerprint) throw new HttpError("Book already exists", 400);

    await book.save();
    await book.setBookGenres(bookGenreIds);
    return book;
  }

  async activateBook(id) {
    const book = await bookRepository.findById(id);
    if (!book) throw new HttpError("Book not found", 404);
    book.isActive = true;
    return await book.save();
  }

  async deleteBookById(id) {
    const book = await bookRepository.findById(id);
    if (!book) throw new HttpError("Book not found", 404);
    await book.setBookGenres([]);
    const bookRequest = book.getBookRequest();
    if (bookRequest)
      await bookRequestService.updateBookRequestWithBookAttributes(
        bookRequest,
        {
          title: book.title,
          authors: book.authors,
          edition: book.edition,
          languageCode: book.languageCode,
        }
      );
    return await bookRepository.deleteById(id);
  }

  _buildBookFingerprint(book) {
    let fingerprint = book.title;
    book.authors.array.forEach((element) => {
      fingerprint += element;
    });
    fingerprint = fingerprint + book.edition + book.languageCode;

    return crypto
      .createHash("sha256")
      .update(fingerprint, "utf8")
      .digest("hex");
  }
}

export default new BookService();
