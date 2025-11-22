import bookGenreRepository from "../repositories/book-genre.repository";
import bookService from "./book.service";

class BookGenreService {
  async createBookGenre(data) {
    const existingCode = await bookGenreRepository.findByCode(data.code);
    if (existingCode) throw new Error("Code already exists");
    const existingName = await bookGenreRepository.findByName(data.name);
    if (existingName) throw new Error("Name already exists");

    return await bookGenreRepository.create(data);
  }

  async getBookGenreById(id) {
    return await bookGenreRepository.findById(id);
  }

  async getBookGenreByCode(code) {
    return await bookGenreRepository.findByCode(code);
  }

  async getBookGenreByName(name) {
    return await bookGenreRepository.findByName(name);
  }

  async getBookGenresByIds(ids) {
    return await bookGenreRepository.findByIds(ids);
  }

  async getBookGenres() {
    return await bookGenreRepository.findAll();
  }

  async updateBookGenre(id, data) {
    const bookGenre = await bookGenreRepository.findById(id);
    if (!bookGenre) throw new Error("Book genre not found");
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
        throw new Error("Code already exists");
      }
    }

    if (updates.name !== undefined) {
      const existingName = await bookGenreRepository.findByName(updates.name);
      if (existingName && existingName.id !== id) {
        throw new Error("Name already exists");
      }
    }

    return await bookGenre.update(updates);
  }

  async deleteBookGenre(id) {
    const bookGenre = await bookGenreRepository.findById(id);
    if (!bookGenre) throw new Error("Book genre not found");
    const count = await bookService.countBooksByBookGenreId(id);
    if (count)
      throw new Error(
        "This book genre cannot be deleted because it has associated books"
      );
    return await bookGenreRepository.delete(id);
  }
}

export default new BookGenreService();
