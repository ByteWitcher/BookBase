import db from "../entities/index.js";

const { Book, BookGenre } = db;

class BookRepository {
  create(data) {
    return Book.create(data);
  }

  findById(id) {
    return Book.findByPk(id);
  }

  findByFingerprint(fingerprint) {
    return Book.findOne({ where: { fingerprint } });
  }

  findByBookTypeId(bookTypeId) {
    return Book.findAll({ where: { bookTypeId } });
  }

  findByBookGenreId(bookGenreId) {
    return Book.findAll({
      include: {
        model: BookGenre,
        as: "bookGenres",
        where: { id: bookGenreId },
      },
    });
  }

  findAll() {
    return Book.findAll();
  }

  delete(id) {
    return Book.destroy({ where: { id } });
  }
}

export default new BookRepository();
