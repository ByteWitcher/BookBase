import bookGenreRepository from "../repositories/book-genre.repository.js";
import bookService from "./book.service.js";
import HttpError from "../utils/http-error.util.js";

class BookGenreService {
  async createBookGenre(data) {
    const existingCode = await bookGenreRepository.findByCode(data.code);
    if (existingCode) throw new HttpError(400, "Code already exists");
    const existingName = await bookGenreRepository.findByName(data.name);
    if (existingName) throw new HttpError(400, "Name already exists");

    return await bookGenreRepository.create(data);
  }

  async getBookGenreById(id) {
    const bookGenre = await bookGenreRepository.findById(id);
    if (!bookGenre) throw new HttpError(404, "Book genre not found");
    return bookGenre;
  }

  async getBookGenreByCode(code) {
    const bookGenre = await bookGenreRepository.findByCode(code);
    if (!bookGenre) throw new HttpError(404, "Book genre not found");
    return bookGenre;
  }

  async getBookGenreByName(name) {
    const bookGenre = await bookGenreRepository.findByName(name);
    if (!bookGenre) throw new HttpError(404, "Book genre not found");
    return bookGenre;
  }

  async findBookGenresByIds(ids) {
    return await bookGenreRepository.findByIds(ids);
  }

  async getBookGenres() {
    return await bookGenreRepository.findAll();
  }

  async updateBookGenre(id, data) {
    const bookGenre = await bookGenreRepository.findById(id);
    if (!bookGenre) throw new HttpError(404, "Book genre not found");

    const allowed = ["code", "name", "description"];
    const updates = {};

    allowed.forEach((field) => {
      if (data[field] !== undefined && data[field] !== bookGenre[field]) {
        updates[field] = data[field];
      }
    });

    if (updates.code !== undefined) {
      const existingCode = await bookGenreRepository.findByCode(updates.code);
      if (existingCode && existingCode.id !== id) {
        throw new HttpError(400, "Code already exists");
      }
    }

    if (updates.name !== undefined) {
      const existingName = await bookGenreRepository.findByName(updates.name);
      if (existingName && existingName.id !== id) {
        throw new HttpError(400, "Name already exists");
      }
    }

    return await bookGenre.update(updates);
  }

  async deleteBookGenreById(id) {
    const bookGenre = await bookGenreRepository.findById(id);
    if (!bookGenre) throw new HttpError(404, "Book genre not found");
    const count = await bookService.countBooksByBookGenreId(id);
    if (count)
      throw new HttpError(
        400,
        "This book genre cannot be deleted because it has associated books",
      );
    return await bookGenreRepository.deleteById(id);
  }
}

export default new BookGenreService();
