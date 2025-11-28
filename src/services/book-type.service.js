import bookTypeRepository from "../repositories/book-type.repository.js";
import bookService from "./book.service.js";
import HttpError from "../utils/http-error.util.js";

class BookTypeService {
  async createBookType(data) {
    const existingCode = await bookTypeRepository.findByCode(data.code);
    if (existingCode) throw new HttpError(400, "Code already exists");
    const existingName = await bookTypeRepository.findByName(data.name);
    if (existingName) throw new HttpError(400, "Name already exists");

    return await bookTypeRepository.create(data);
  }

  async getBookTypeById(id) {
    const bookType = await bookTypeRepository.findById(id);
    if (!bookType) throw new HttpError(404, "Book type not found");
    return bookType;
  }

  async getBookTypeByCode(code) {
    const bookType = await bookTypeRepository.findByCode(code);
    if (!bookType) throw new HttpError(404, "Book type not found");
    return bookType;
  }

  async getBookTypeByName(name) {
    const bookType = await bookTypeRepository.findByName(name);
    if (!bookType) throw new HttpError(404, "Book type not found");
    return bookType;
  }

  async getBookTypes() {
    return await bookTypeRepository.findAll();
  }

  async updateBookType(id, data) {
    const bookType = await bookTypeRepository.findById(id);
    if (!bookType) throw new HttpError(404, "Book type not found");

    const allowed = ["code", "name", "description"];
    const updates = {};

    allowed.forEach((field) => {
      if (data[field] !== undefined && data[field] !== bookType[field]) {
        updates[field] = data[field];
      }
    });

    if (updates.code !== undefined) {
      const existingCode = await bookTypeRepository.findByCode(updates.code);
      if (existingCode && existingCode.id !== id) {
        throw new HttpError(400, "Code already exists");
      }
    }

    if (updates.name !== undefined) {
      const existingName = await bookTypeRepository.findByName(updates.name);
      if (existingName && existingName.id !== id) {
        throw new HttpError(400, "Name already exists");
      }
    }

    return await bookType.update(updates);
  }

  async deleteBookTypeById(id) {
    const bookType = await bookTypeRepository.findById(id);
    if (!bookType) throw new HttpError(404, "Book type not found");
    const count = await bookService.countBooksByBookTypeId(id);
    if (count)
      throw new HttpError(
        400,
        "This book type cannot be deleted because it has associated books",
      );

    return await bookTypeRepository.deleteById(id);
  }
}

export default new BookTypeService();
