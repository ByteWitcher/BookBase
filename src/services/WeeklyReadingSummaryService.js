import WeeklyReadingSummaryRepository from '../repositories/WeeklyReadingSummaryRepository.js';
import ReadingSessionRepository from '../repositories/ReadingSessionRepository.js';

class WeeklyReadingSummaryService {
  async createSummary(data) {
    
    // Directly create a summary (expects all fields in data)
    return await WeeklyReadingSummaryRepository.create(data);
  }

  async getSummaryById(id) {
    return await WeeklyReadingSummaryRepository.findById(id);
  }

  async updateSummary(id, updates) {
    return await WeeklyReadingSummaryRepository.update(id, updates);
  }

  async deleteSummary(id) {
    return await WeeklyReadingSummaryRepository.delete(id);
  }

  /**
   * Generate a weekly summary for a user from their reading sessions in a week.
   * @param {string} userId
   * @param {string} weekStart - ISO date string
   * @param {string} weekEnd - ISO date string
   * @returns {Promise<Object>} The created or updated summary
   */
  async generateSummaryFromSessions(userId, weekStart, weekEnd) {
    // Get all sessions for user in the week
    const sessions = await ReadingSessionRepository.findAllByUser(userId);
    // Filter sessions in week range
    const startDate = new Date(weekStart);
    const endDate = new Date(weekEnd);
    const weekSessions = sessions.filter(s => {
      const sessionStart = new Date(s.startTime);
      return sessionStart >= startDate && sessionStart <= endDate;
    });
    // Aggregate stats
    let totalMinutes = 0;
    let totalPages = 0;
    let totalSpeed = 0;
    let speedCount = 0;
    for (const session of weekSessions) {
      const start = new Date(session.startTime);
      const end = new Date(session.endTime);
      const minutes = (end - start) / 60000;
      totalMinutes += minutes > 0 ? minutes : 0;
      totalPages += session.pagesRead || (session.endPage - session.startPage);
      if (minutes > 0) {
        totalSpeed += (session.pagesRead || (session.endPage - session.startPage)) / (minutes / 60);
        speedCount++;
      }
    }
    const averageSpeed = speedCount > 0 ? totalSpeed / speedCount : 0;
    // Upsert summary
    let summary = await WeeklyReadingSummaryRepository.findByWeekForUser(userId, weekStart, weekEnd);
    if (summary) {
      summary = await WeeklyReadingSummaryRepository.update(summary.id, {
        totalReadingMinutes: Math.round(totalMinutes),
        totalPagesRead: totalPages,
        averageSpeed: Math.round(averageSpeed * 100) / 100
      });
    } else {
      summary = await WeeklyReadingSummaryRepository.create({
        userId,
        weekStart,
        weekEnd,
        totalReadingMinutes: Math.round(totalMinutes),
        totalPagesRead: totalPages,
        averageSpeed: Math.round(averageSpeed * 100) / 100
      });
    }
    return summary;
  }

  /**
   * Get all weekly summaries for a user
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async getAllSummariesByUser(userId) {
    return await WeeklyReadingSummaryRepository.findAllByUser(userId);
  }

  /**
   * Get all weekly summaries with filtering, sorting, and pagination
   * @param {Object} options - { where, limit, offset, order }
   * @returns {Promise<Array>}
   */
  async getAllSummaries(options = {}) {
    // options: { where, limit, offset, order }
    return await WeeklyReadingSummaryRepository.findAll(options);
  }
}

export default new WeeklyReadingSummaryService();
