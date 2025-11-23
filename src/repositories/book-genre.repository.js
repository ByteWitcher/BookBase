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

  findByIds(ids) {
    return BookGenre.findAll({ where: { ids } });
  }

  findAll() {
    return BookGenre.findAll();
  }

  deleteById(id) {
    return BookGenre.destroy({ where: { id } });
  }
}

export default new BookGenreRepository();
