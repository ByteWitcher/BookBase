import db from "../entities/index.js";

const { BookRequest } = db;

class BookRequestRepository {
  create(data) {
    return BookRequest.create(data);
  }

  findById(id) {
    return BookRequest.findByPk(id);
  }

  async findFiltered({ where, include, limit, offset, order }) {
    return BookRequest.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order,
      distinct: true,
    });
  }

  deleteById(id) {
    return BookRequest.destroy({ where: { id } });
  }
}

export default new BookRequestRepository();
