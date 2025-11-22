import bookTypeRepository from "../repositories/book-type.repository";
import bookService from "./book.service";

class BookTypeService {
  async createBookType(data) {
    const existingCode = await bookTypeRepository.findByCode(data.code);
    if (existingCode) throw new Error("Code already exists");
    const existingName = await bookTypeRepository.findByName(data.name);
    if (existingName) throw new Error("Name already exists");

    return await bookTypeRepository.create(data);
  }

  async getBookTypeById(id) {
    return await bookTypeRepository.findById(id);
  }

  async getBookTypeByCode(code) {
    return await bookTypeRepository.findByCode(code);
  }

  async getBookTypeByName(name) {
    return await bookTypeRepository.findByName(name);
  }

  async getBookTypes() {
    return await bookTypeRepository.findAll();
  }

  async updateBookType(id, data) {
    const bookType = await bookTypeRepository.findById(id);
    if (!bookType) throw new Error("Book type not found");

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
        throw new Error("Code already exists");
      }
    }

    if (updates.name !== undefined) {
      const existingName = await bookTypeRepository.findByName(updates.name);
      if (existingName && existingName.id !== id) {
        throw new Error("Name already exists");
      }
    }

    return await bookType.update(updates);
  }

  async deleteBookType(id) {
    const bookType = await bookTypeRepository.findById(id);
    if (!bookType) throw new Error("Book type not found");
    const count = await bookService.countBooksByBookTypeId(id);
    if (count)
      throw new Error(
        "This book type cannot be deleted because it has associated books"
      );
    return await bookTypeRepository.delete(id);
  }
}

export default new BookTypeService();
