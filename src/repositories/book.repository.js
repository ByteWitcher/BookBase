import db from "../entities/index.js";

const { Book, BookType, BookGenre } = db;

class BookRepository {
  create(data) {
    return Book.create(data);
  }

  findById(id) {
    return Book.findByPk(id, {
      include: [
        { model: BookType, as: "bookType" },
        { model: BookGenre, as: "bookGenres" },
      ],
    });
  }

  findByFingerprint(fingerprint) {
    return Book.findOne({ where: { fingerprint } });
  }

  async findFiltered({ where, include, limit, offset, order }) {
    return Book.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order,
      distinct: true,
    });
  }

  countByBookTypeId(bookTypeId) {
    return Book.count({ distinct: true, where: { bookTypeId } });
  }

  countByBookGenreId(bookGenreId) {
    return Book.count({
      distinct: true,
      include: {
        model: BookGenre,
        as: "bookGenres",
        where: { id: bookGenreId },
        required: true,
      },
    });
  }

  deleteById(id) {
    return Book.destroy({ where: { id } });
  }
}

export default new BookRepository();
