import models from '../entities/index.js';

const { ReadingAchievement } = models;

class ReadingAchievementRepository {
  async create(data) {
    return await ReadingAchievement.create(data);
  }

  async findById(id) {
    return await ReadingAchievement.findByPk(id);
  }

  async findAllByUser(userId) {
    return await ReadingAchievement.findAll({ where: { userId } });
  }

  async findByCodeForUser(userId, code) {
    return await ReadingAchievement.findOne({ where: { userId, code } });
  }

  async findAll({ where = {}, limit, offset, order } = {}) {
    return await ReadingAchievement.findAll({ where, limit, offset, order });
  }

  async delete(id) {
    const achievement = await ReadingAchievement.findByPk(id);
    if (!achievement) return null;
    await achievement.destroy();
    return true;
  }


}

export default new ReadingAchievementRepository();
