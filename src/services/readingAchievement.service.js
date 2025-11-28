import ReadingAchievementRepository from "../repositories/readingAchievement.repository.js";
import ReadingSessionRepository from "../repositories/readingSession.repository.js";
import WeeklyReadingSummaryRepository from "../repositories/weeklyReadingSummary.repository.js";

const STREAK_CODES = [
  { code: "STREAK_3", label: "3-Day Reading Streak", length: 3 },
  { code: "STREAK_5", label: "5-Day Reading Streak", length: 5 },
  { code: "STREAK_7", label: "7-Day Reading Streak", length: 7 },
  { code: "STREAK_14", label: "14-Day Reading Streak", length: 14 },
];

const ACHIEVEMENTS = {
  FIRST_SESSION: { code: "FIRST_SESSION", label: "First Reading Session" },
  FIFTY_PAGES_ONE_DAY: {
    code: "FIFTY_PAGES_ONE_DAY",
    label: "Read 50 Pages in One Day",
  },
  TEN_BOOKS_FINISHED: {
    code: "TEN_BOOKS_FINISHED",
    label: "Finished 10 Books",
  },
  CONSISTENT_READER: {
    code: "CONSISTENT_READER",
    label: "Consistent Reader (4 Weeks)",
  },
};

class ReadingAchievementService {
  async checkAndUnlockAchievements(userId, sessionData) {
    const unlocked = await ReadingAchievementRepository.findAllByUser(userId);
    const unlockedCodes = new Set(unlocked.map((a) => a.code));
    const newAchievements = [];

    // First session
    if (
      !unlockedCodes.has("FIRST_SESSION") &&
      (await this.checkFirstSession(userId))
    ) {
      newAchievements.push(
        await this.unlock(userId, ACHIEVEMENTS.FIRST_SESSION),
      );
    }
    // Streak achievements
    const highestStreak = await this.getLongestStreak(userId);
    for (let i = STREAK_CODES.length - 1; i >= 0; i--) {
      const { code, label, length } = STREAK_CODES[i];
      if (highestStreak >= length && !unlockedCodes.has(code)) {
        newAchievements.push(await this.unlock(userId, { code, label }));
        break; // Only unlock the highest streak not yet rewarded
      }
    }
    // 50 pages in one day
    if (
      !unlockedCodes.has("FIFTY_PAGES_ONE_DAY") &&
      (await this.checkFiftyPagesOneDay(userId, sessionData))
    ) {
      newAchievements.push(
        await this.unlock(userId, ACHIEVEMENTS.FIFTY_PAGES_ONE_DAY),
      );
    }
    // Ten books finished
    if (
      !unlockedCodes.has("TEN_BOOKS_FINISHED") &&
      (await this.checkTenBooksFinished(userId))
    ) {
      newAchievements.push(
        await this.unlock(userId, ACHIEVEMENTS.TEN_BOOKS_FINISHED),
      );
    }
    // Consistent reader
    if (
      !unlockedCodes.has("CONSISTENT_READER") &&
      (await this.checkConsistentReader(userId))
    ) {
      newAchievements.push(
        await this.unlock(userId, ACHIEVEMENTS.CONSISTENT_READER),
      );
    }
    return newAchievements;
  }

  async unlock(userId, { code, label }) {
    return await ReadingAchievementRepository.create({
      userId,
      code,
      label,
      unlockedAt: new Date(),
    });
  }

  async checkFirstSession(userId) {
    const sessions = await ReadingSessionRepository.findAllByUser(userId);
    return sessions.length === 1;
  }

  async getLongestStreak(userId) {
    const sessions = await ReadingSessionRepository.findAllByUser(userId);
    const days = Array.from(
      new Set(
        sessions.map((s) => new Date(s.startTime).toISOString().slice(0, 10)),
      ),
    ).sort();
    let maxStreak = 0,
      currentStreak = 1;
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i - 1]);
      const curr = new Date(days[i]);
      if (curr - prev === 86400000) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    }
    return maxStreak;
  }

  async checkFiftyPagesOneDay(userId, sessionData) {
    // Get all sessions for the user on the same day
    const targetDay = new Date(sessionData.startTime)
      .toISOString()
      .slice(0, 10);
    const sessions = await ReadingSessionRepository.findAllByUser(userId);
    let totalPages = 0;
    for (const s of sessions) {
      const sessionDay = new Date(s.startTime).toISOString().slice(0, 10);
      if (sessionDay === targetDay) {
        totalPages += s.endPage - s.startPage;
      }
    }
    return totalPages >= 50;
  }

  async checkTenBooksFinished(userId) {
    const sessions = await ReadingSessionRepository.findAllByUser(userId);
    const finishedBooks = new Set();
    // Import Book model here to avoid circular dependency at top
    const { Book } = (await import("../entities/index.js")).default;
    for (const s of sessions) {
      const book = await Book.findByPk(s.bookId);
      if (book && s.endPage === book.pageCount) {
        finishedBooks.add(s.bookId);
      }
    }
    return finishedBooks.size >= 10;
  }

  async checkConsistentReader(userId) {
    // Check if user has summaries for at least 4 consecutive weeks
    const summaries =
      await WeeklyReadingSummaryRepository.findAllByUser(userId);
    const weeks = summaries.map((s) => s.weekStart).sort();
    for (let i = 0; i < weeks.length - 3; i++) {
      const w1 = new Date(weeks[i]);
      const w2 = new Date(weeks[i + 1]);
      const w3 = new Date(weeks[i + 2]);
      const w4 = new Date(weeks[i + 3]);
      if (
        w2 - w1 === 7 * 86400000 &&
        w3 - w2 === 7 * 86400000 &&
        w4 - w3 === 7 * 86400000
      )
        return true;
    }
    return false;
  }

  /**
   * Get achievements with filtering, sorting, and pagination
   * @param {Object} options - { where, limit, offset, order }
   * @returns {Promise<Array>}
   */
  async getAchievements(options = {}) {
    return await ReadingAchievementRepository.findAll(options);
  }

  /**
   * Get all achievements for a user
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async getAchievementsByUser(userId) {
    return await ReadingAchievementRepository.findAllByUser(userId);
  }

  /**
   * Get achievement by id
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async getAchievementById(id) {
    return await ReadingAchievementRepository.findById(id);
  }

  /**
   * Delete achievement by id
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async deleteAchievement(id) {
    return await ReadingAchievementRepository.delete(id);
  }
}

export default new ReadingAchievementService();
