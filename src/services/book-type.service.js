import bookTypeRepository from "../repositories/book-type.repository.js";
import bookService from "./book.service.js";
import HttpError from "../utils/http-error.util.js";

class BookTypeService {
  async createBookType(data) {
    const existingCode = await bookTypeRepository.findByCode(data.code);
    if (existingCode) throw new HttpError("Code already exists", 400);
    const existingName = await bookTypeRepository.findByName(data.name);
    if (existingName) throw new HttpError("Name already exists", 400);

    return await bookTypeRepository.create(data);
  }

  async getBookTypeById(id) {
    const bookType = await bookTypeRepository.findById(id);
    if (!bookType) throw new HttpError("Book type not found", 404);
    return bookType;
  }

  async getBookTypeByCode(code) {
    const bookType = await bookTypeRepository.findByCode(code);
    if (!bookType) throw new HttpError("Book type not found", 404);
    return bookType;
  }

  async getBookTypeByName(name) {
    const bookType = await bookTypeRepository.findByName(name);
    if (!bookType) throw new HttpError("Book type not found", 404);
    return bookType;
  }

  async getBookTypes() {
    return await bookTypeRepository.findAll();
  }

  async updateBookType(id, data) {
    const bookType = await bookTypeRepository.findById(id);
    if (!bookType) throw new HttpError("Book type not found", 404);

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
        throw new HttpError("Code already exists", 400);
      }
    }

    if (updates.name !== undefined) {
      const existingName = await bookTypeRepository.findByName(updates.name);
      if (existingName && existingName.id !== id) {
        throw new HttpError("Name already exists", 400);
      }
    }

    return await bookType.update(updates);
  }

  async deleteBookTypeById(id) {
    const bookType = await bookTypeRepository.findById(id);
    if (!bookType) throw new HttpError("Book type not found", 404);
    const count = await bookService.countBooksByBookTypeId(id);
    if (count)
      throw new HttpError(
        "This book type cannot be deleted because it has associated books",
        400
      );

    return await bookTypeRepository.deleteById(id);
  }
}

export default new BookTypeService();
