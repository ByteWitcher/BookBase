import models from '../entities/index.js';

const { WeeklyReadingSummary } = models;

class WeeklyReadingSummaryRepository {
    
  async create(data) {
    return await WeeklyReadingSummary.create(data);
  }

  async findById(id) {
    return await WeeklyReadingSummary.findByPk(id);
  }

  async findAllByUser(userId) {
    return await WeeklyReadingSummary.findAll({ where: { userId } });
  }

  async findByWeekForUser(userId, weekStart, weekEnd) {
    return await WeeklyReadingSummary.findOne({ where: { userId, weekStart, weekEnd } });
  }

  async findAll({ where = {}, limit, offset, order } = {}) {
    return await WeeklyReadingSummary.findAll({ where, limit, offset, order });
  }

  async update(id, updates) {
    const summary = await WeeklyReadingSummary.findByPk(id);
    if (!summary) return null;
    return await summary.update(updates);
  }

  async delete(id) {
    const summary = await WeeklyReadingSummary.findByPk(id);
    if (!summary) return null;
    await summary.destroy();
    return true;
  }
}

export default new WeeklyReadingSummaryRepository();
