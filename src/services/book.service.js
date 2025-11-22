import bookRepository from "../repositories/book.repository";
import bookTypeService from "./book-type.service";
import bookGenreService from "./book-genre.service";
import { Op } from "sequelize";
import db from "../entities/index.js";

const { BookType, BookGenre } = db;

class BookService {
  async createBook(userId, data) {
    const { bookGenreIds, ...bookData } = data;

    const fingerprint = this.buildFingerprint(bookData);

    const existingFingerprint = await bookRepository.findByFingerprint(
      fingerprint
    );
    if (existingFingerprint) throw new Error("Book already exists");

    const existingBookType = await bookTypeService.getBookTypeById(
      bookData.bookTypeId
    );
    if (!existingBookType) throw new Error("Book type not found");

    const existingBookGenres = await bookGenreService.getBookGenresByIds(
      bookGenreIds
    );

    if (existingBookGenres.length !== bookGenreIds.length)
      throw new Error("One or more book genres are not found");

    // add s3PdfUrl later
    const book = await bookRepository.create({
      ...bookData,
      fingerprint,
      uploaderId: userId,
      approverId: userId,
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
      languageCode,
      bookTypeId,
      bookGenreIds,
      minRating,
      maxRating,
      minLikes,
      maxLikes,
      minPages,
      maxPages,
      startDate,
      endDate,
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

    if (languageCode) {
      where.languageCode = languageCode;
    }

    if (bookTypeId) {
      where.bookTypeId = bookTypeId;
    }

    if (minRating || maxRating) {
      where.rating = {};
      if (minRating) where.rating[Op.gte] = Number(minRating);
      if (maxRating) where.rating[Op.lte] = Number(maxRating);
    }

    if (minLikes || maxLikes) {
      where.likes = {};
      if (minLikes) where.likes[Op.gte] = Number(minLikes);
      if (maxLikes) where.likes[Op.lte] = Number(maxLikes);
    }

    if (minPages || maxPages) {
      where.pageCount = {};
      if (minPages) where.pageCount[Op.gte] = Number(minPages);
      if (maxPages) where.pageCount[Op.lte] = Number(maxPages);
    }

    if (startDate || endDate) {
      where.releaseDate = {};
      if (startDate) where.releaseDate[Op.gte] = new Date(startDate);
      if (endDate) where.releaseDate[Op.lte] = new Date(endDate);
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
      "rating",
      "likes",
      "pageCount",
      "releaseDate",
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
    if (!book) throw new Error("Book not found");
    const { bookGenreIds, ...bookData } = data;
    const allowed = [
      "title",
      "authors",
      "languageCode",
      "edition",
      "description",
      "pageCount",
      "releaseDate",
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
      if (!existingBookType) throw new Error("Book type not found");
    }

    if (bookGenreIds !== undefined) {
      const existingBookGenres = await bookGenreService.getBookGenresByIds(
        bookGenreIds
      );

      if (existingBookGenres.length !== bookGenreIds.length)
        throw new Error("One or more book genres are not found");
    }

    Object.assign(book, updates);
    const fingerprint = this.buildFingerprint(book);
    const existingFingerprint = await bookRepository.findByFingerprint(
      fingerprint
    );
    if (existingFingerprint) throw new Error("Book already exists");

    await book.save();
    await book.setBookGenres(bookGenreIds);
    return book;
  }

  async deleteBook(id) {
    const book = await bookRepository.findById(id);
    if (!book) throw new Error("Book not found");
    await book.setBookGenres([]);
    return await bookRepository.delete(id);
  }

  buildFingerprint(book) {
    let fingerprint = book.title;
    book.authors.array.forEach((element) => {
      fingerprint += element;
    });
    fingerprint = fingerprint + book.edition + book.languageCode;
    return fingerprint;
  }
}

export default new BookService();
