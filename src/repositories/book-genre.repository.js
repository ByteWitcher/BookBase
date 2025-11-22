import db from "../entities/index.js";

const { BookGenre } = db;

class BookGenreRepository {
  create(data) {
    return BookGenre.create(data);
  }

  findById(id) {
    return BookGenre.findByPk(id);
  }

  findByCode(code) {
    return BookGenre.findOne({ where: { code } });
  }

  findByName(name) {
    return BookGenre.findOne({ where: { name } });
  }

  findAll() {
    return BookGenre.findAll();
  }

  delete(id) {
    return BookGenre.destroy({ where: { id } });
  }
}

export default new BookGenreRepository();
