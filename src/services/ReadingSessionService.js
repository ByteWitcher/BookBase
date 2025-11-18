import models from '../entities/index.js';
import ReadingSessionRepository from '../repositories/ReadingSessionRepository.js';

const { Book } = models;

function validateSessionInput({ book, startPage, endPage, startTime, endTime }) {
  if (!book) throw new Error('Book not found');
  if (startPage < 1 || endPage > book.pageNumbers || startPage > endPage) {
    throw new Error('Invalid page range for this book');
  }
  if (!startTime || !endTime) throw new Error('Start and end time are required');
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new Error('Invalid date format');
  if (end <= start) throw new Error('End time must be after start time');
}

/**
 * @typedef {Object} UserBookProgress
 * @property {string} bookId
 * @property {string} title
 * @property {number} farthestPage
 */

class ReadingSessionService {


  async createSession({ userId, bookId, startTime, endTime, startPage, endPage }) {
    const book = await Book.findByPk(bookId);
    validateSessionInput({ book, startPage, endPage, startTime, endTime });
    return await ReadingSessionRepository.create({
      userId,
      bookId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      startPage,
      endPage
    });
  }

  async updateSession(id, updates) {
    // Fetch current session and book if needed for validation
    const session = await ReadingSessionRepository.findById(id);
    if (!session) throw new Error('Session not found');
    const bookId = updates.bookId || session.bookId;
    const book = await Book.findByPk(bookId);
    const startPage = updates.startPage !== undefined ? updates.startPage : session.startPage;
    const endPage = updates.endPage !== undefined ? updates.endPage : session.endPage;
    const startTime = updates.startTime || session.startTime;
    const endTime = updates.endTime || session.endTime;
    validateSessionInput({ book, startPage, endPage, startTime, endTime });
    return await ReadingSessionRepository.update(id, updates);
  }

  async deleteSession(id) {
    return await ReadingSessionRepository.delete(id);
  }

  async getSessionById(id) {
    return await ReadingSessionRepository.findById(id);
  }


  async getAllSessionsByUser(userId) {
    return await ReadingSessionRepository.findAllByUser(userId);
  }

  async getLatestSessionByUserAndBook(userId, bookId) {
    const sessions = await ReadingSessionRepository.findAllByUser(userId);
    // Filter by bookId and sort by endTime descending
    const filtered = sessions.filter(s => s.bookId === bookId);
    filtered.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));
    return filtered[0] || null;
  }

  /**
   * Returns a list of books the user has read, with the farthest page reached for each.
   * @param {string} userId
   * @returns {Promise<UserBookProgress[]>}
   */
  async getUserBookProgress(userId) {
    const sessions = await ReadingSessionRepository.findAllByUser(userId);
    // Group by bookId and get farthest page
    const progressMap = {};
    for (const session of sessions) {
      if (!progressMap[session.bookId] || session.endPage > progressMap[session.bookId].farthestPage) {
        progressMap[session.bookId] = { farthestPage: session.endPage };
      }
    }
    // Fetch book titles
    const result = [];
    for (const bookId of Object.keys(progressMap)) {
      const book = await Book.findByPk(bookId);
      if (book) {
        result.push({
          bookId,
          title: book.title,
          farthestPage: progressMap[bookId].farthestPage
        });
      }
    }
    return result;
  }
}

export default new ReadingSessionService();
