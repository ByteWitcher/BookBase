import db from "../entities/index.js";

const { BookType } = db;

class BookTypeRepository {
  create(data) {
    return BookType.create(data);
  }

  findById(id) {
    return BookType.findByPk(id);
  }

  findById(id) {
    return BookType.findByPk(id);
  }

  findByCode(code) {
    return BookType.findOne({ where: { code } });
  }

  findByName(name) {
    return BookType.findOne({ where: { name } });
  }

  findAll() {
    return BookType.findAll();
  }

  delete(id) {
    return BookType.destroy({ where: { id } });
  }
}

export default new BookTypeRepository();
