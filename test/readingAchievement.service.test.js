import WeeklyReadingSummaryRepository from '../src/repositories/weeklyReadingSummary.repository.js';
import ReadingSessionRepository from '../src/repositories/readingSession.repository.js';
import { describe, it, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest';
import ReadingAchievementService from '../src/services/readingAchievement.service.js';
import ReadingAchievementRepository from '../src/repositories/readingAchievement.repository.js';

describe('ReadingAchievementService', () => {
  describe('getAchievements', () => {
    let repoFindAllStub;
    const fakeAchievements = [
      { id: 'a1', code: 'FIRST_SESSION', userId: 'u1' },
      { id: 'a2', code: 'STREAK_3', userId: 'u2' }
    ];
    beforeEach(() => {
      repoFindAllStub = vi.spyOn(ReadingAchievementRepository, 'findAll').mockResolvedValue(fakeAchievements);
    });
    afterEach(() => {
      repoFindAllStub.mockRestore();
      vi.restoreAllMocks();
    });
    it('should return all achievements with options', async () => {
      const result = await ReadingAchievementService.getAchievements({ where: { code: 'FIRST_SESSION' } });
      expect(result).toEqual(fakeAchievements);
      expect(repoFindAllStub).toHaveBeenCalledWith({ where: { code: 'FIRST_SESSION' } });
    });
  });

  describe('getAchievementsByUser', () => {
    let repoFindAllByUserStub;
    const fakeAchievements = [
      { id: 'a1', code: 'FIRST_SESSION', userId: 'u1' }
    ];
    beforeEach(() => {
      repoFindAllByUserStub = vi.spyOn(ReadingAchievementRepository, 'findAllByUser').mockResolvedValue(fakeAchievements);
    });
    afterEach(() => {
      repoFindAllByUserStub.mockRestore();
      vi.restoreAllMocks();
    });
    it('should return all achievements for a user', async () => {
      const result = await ReadingAchievementService.getAchievementsByUser('u1');
      expect(result).toEqual(fakeAchievements);
      expect(repoFindAllByUserStub).toHaveBeenCalledWith('u1');
    });
  });

  describe('getAchievementById', () => {
    let repoFindByIdStub;
    const fakeAchievement = { id: 'a1', code: 'FIRST_SESSION', userId: 'u1' };
    beforeEach(() => {
      repoFindByIdStub = vi.spyOn(ReadingAchievementRepository, 'findById').mockResolvedValue(fakeAchievement);
    });
    afterEach(() => {
      repoFindByIdStub.mockRestore();
      vi.restoreAllMocks();
    });
    it('should return the achievement by id', async () => {
      const result = await ReadingAchievementService.getAchievementById('a1');
      expect(result).toEqual(fakeAchievement);
      expect(repoFindByIdStub).toHaveBeenCalledWith('a1');
    });
  });

  describe('deleteAchievement', () => {
    let repoDeleteStub;
    beforeEach(() => {
      repoDeleteStub = vi.spyOn(ReadingAchievementRepository, 'delete').mockResolvedValue(true);
    });
    afterEach(() => {
      repoDeleteStub.mockRestore();
      vi.restoreAllMocks();
    });
    it('should delete the achievement by id', async () => {
      const result = await ReadingAchievementService.deleteAchievement('a1');
      expect(result).toBe(true);
      expect(repoDeleteStub).toHaveBeenCalledWith('a1');
    });
  });
  describe('checkFirstSession', () => {
    let repoFindAllStub;
    const service = ReadingAchievementService;
    beforeEach(() => {
        repoFindAllStub = vi.spyOn(ReadingSessionRepository, 'findAllByUser');
    });
    afterEach(() => {
        repoFindAllStub.mockRestore();
        vi.restoreAllMocks();
    });
    it('should return true if user has exactly one session', async () => {
        repoFindAllStub.mockResolvedValue([{ id: 's1' }]);
        const result = await service.checkFirstSession('u1');
        expect(result).toBe(true);
        expect(repoFindAllStub).toHaveBeenCalledWith('u1');
    });
    it('should return false if user has zero or more than one session', async () => {
        repoFindAllStub.mockResolvedValue([]);
        expect(await service.checkFirstSession('u1')).toBe(false);
        repoFindAllStub.mockResolvedValue([{ id: 's1' }, { id: 's2' }]);
        expect(await service.checkFirstSession('u1')).toBe(false);
    });
    });

    describe('checkConsistentReader', () => {
    let repoFindAllStub;
    const service = ReadingAchievementService;
    beforeEach(() => {
        repoFindAllStub = vi.spyOn(WeeklyReadingSummaryRepository, 'findAllByUser');
    });
    afterEach(() => {
        repoFindAllStub.mockRestore();
        vi.restoreAllMocks();
    });
    it('should return true if user has 4 consecutive weeks', async () => {
        // 4 consecutive Mondays
        const weeks = [
        { weekStart: '2025-11-03' },
        { weekStart: '2025-11-10' },
        { weekStart: '2025-11-17' },
        { weekStart: '2025-11-24' }
        ];
        repoFindAllStub.mockResolvedValue(weeks);
        expect(await service.checkConsistentReader('u1')).toBe(true);
    });
    it('should return false if user does not have 4 consecutive weeks', async () => {
        const weeks = [
        { weekStart: '2025-11-03' },
        { weekStart: '2025-11-17' },
        { weekStart: '2025-11-24' },
        { weekStart: '2025-12-01' }
        ];
        repoFindAllStub.mockResolvedValue(weeks);
        expect(await service.checkConsistentReader('u1')).toBe(false);
    });
    });

    describe('checkFiftyPagesOneDay', () => {
    let repoFindAllStub;
    const service = ReadingAchievementService;
    const sessionData = { startTime: '2025-11-22T10:00:00Z' };
    beforeEach(() => {
        repoFindAllStub = vi.spyOn(ReadingSessionRepository, 'findAllByUser');
    });
    afterEach(() => {
        repoFindAllStub.mockRestore();
        vi.restoreAllMocks();
    });
    it('should return true if user read 50+ pages in one day', async () => {
        const sessions = [
        { startTime: '2025-11-22T09:00:00Z', startPage: 1, endPage: 30 },
        { startTime: '2025-11-22T15:00:00Z', startPage: 30, endPage: 51 }
        ];
        repoFindAllStub.mockResolvedValue(sessions);
        expect(await service.checkFiftyPagesOneDay('u1', sessionData)).toBe(true);
    });
    it('should return false if user read less than 50 pages in one day', async () => {
        const sessions = [
        { startTime: '2025-11-22T09:00:00Z', startPage: 1, endPage: 20 },
        { startTime: '2025-11-22T15:00:00Z', startPage: 20, endPage: 40 }
        ];
        repoFindAllStub.mockResolvedValue(sessions);
        expect(await service.checkFiftyPagesOneDay('u1', sessionData)).toBe(false);
    });
    });

    describe('checkTenBooksFinished', () => {
    let repoFindAllStub, bookFindStub;
    const service = ReadingAchievementService;
    // Dynamically import Book model for mocking
    let Book;
    beforeAll(async () => {
      Book = (await import('../src/entities/index.js')).default.Book;
    });
    beforeEach(() => {
      repoFindAllStub = vi.spyOn(ReadingSessionRepository, 'findAllByUser');
      bookFindStub = vi.spyOn(Book, 'findByPk');
    });
    afterEach(() => {
      repoFindAllStub.mockRestore();
      bookFindStub.mockRestore();
      vi.restoreAllMocks();
    });
    it('should return true if user finished 10 or more books', async () => {
      const sessions = Array.from({ length: 10 }, (_, i) => ({
        bookId: `b${i + 1}`,
        endPage: 100
      }));
      repoFindAllStub.mockResolvedValue(sessions);
      // All books have 100 pages
      bookFindStub.mockImplementation(async (id) => ({ id, pageNumbers: 100 }));
      expect(await service.checkTenBooksFinished('u1')).toBe(true);
    });
    it('should return false if user finished less than 10 books', async () => {
      const sessions = Array.from({ length: 9 }, (_, i) => ({
        bookId: `b${i + 1}`,
        endPage: 100
      }));
      repoFindAllStub.mockResolvedValue(sessions);
      bookFindStub.mockImplementation(async (id) => ({ id, pageNumbers: 100 }));
      expect(await service.checkTenBooksFinished('u1')).toBe(false);
    });
    it('should not count unfinished books', async () => {
      const sessions = [
        { bookId: 'b1', endPage: 100 },
        { bookId: 'b2', endPage: 50 }, // not finished
        { bookId: 'b3', endPage: 100 },
        { bookId: 'b4', endPage: 100 },
        { bookId: 'b5', endPage: 100 },
        { bookId: 'b6', endPage: 100 },
        { bookId: 'b7', endPage: 100 },
        { bookId: 'b8', endPage: 100 },
        { bookId: 'b9', endPage: 100 },
        { bookId: 'b10', endPage: 100 }
      ];
      repoFindAllStub.mockResolvedValue(sessions);
      // Only b2 is unfinished
      bookFindStub.mockImplementation(async (id) => ({ id, pageNumbers: 100 }));
      expect(await service.checkTenBooksFinished('u1')).toBe(false);
      // Now, make all finished
      const sessions2 = sessions.map((s, i) => ({ ...s, endPage: 100 }));
      repoFindAllStub.mockResolvedValue(sessions2);
      bookFindStub.mockImplementation(async (id) => ({ id, pageNumbers: 100 }));
      expect(await service.checkTenBooksFinished('u1')).toBe(true);
    });
  });
    describe('getLongestStreak', () => {
    let repoFindAllStub;
    const service = ReadingAchievementService;
    beforeEach(() => {
      repoFindAllStub = vi.spyOn(ReadingSessionRepository, 'findAllByUser');
    });
    afterEach(() => {
      repoFindAllStub.mockRestore();
      vi.restoreAllMocks();
    });
    it('should return 3 for a user with a 3-day streak and a 2-day streak', async () => {
      // 2-day streak: 2025-11-01, 2025-11-02
      // 3-day streak: 2025-11-10, 2025-11-11, 2025-11-12
      const sessions = [
        { startTime: '2025-11-01T10:00:00Z' },
        { startTime: '2025-11-02T10:00:00Z' },
        { startTime: '2025-11-10T10:00:00Z' },
        { startTime: '2025-11-11T10:00:00Z' },
        { startTime: '2025-11-12T10:00:00Z' }
      ];
      repoFindAllStub.mockResolvedValue(sessions);
      const result = await service.getLongestStreak('u1');
      expect(result).toBe(3);
    });
  });
    describe('checkAndUnlockAchievements', () => {
    let repoFindAllByUserStub, unlockStub, checkFirstSessionStub, getLongestStreakStub, checkFiftyPagesOneDayStub, checkTenBooksFinishedStub, checkConsistentReaderStub;
    const service = ReadingAchievementService;
    const userId = 'u1';
    const sessionData = { startTime: '2025-11-22T10:00:00Z' };
    beforeEach(() => {
      repoFindAllByUserStub = vi.spyOn(ReadingAchievementRepository, 'findAllByUser').mockResolvedValue([]);
      unlockStub = vi.spyOn(service, 'unlock').mockImplementation(async (uid, ach) => ({ ...ach, userId: uid }));
      checkFirstSessionStub = vi.spyOn(service, 'checkFirstSession').mockResolvedValue(true);
      getLongestStreakStub = vi.spyOn(service, 'getLongestStreak').mockResolvedValue(3);
      checkFiftyPagesOneDayStub = vi.spyOn(service, 'checkFiftyPagesOneDay').mockResolvedValue(true);
      checkTenBooksFinishedStub = vi.spyOn(service, 'checkTenBooksFinished').mockResolvedValue(true);
      checkConsistentReaderStub = vi.spyOn(service, 'checkConsistentReader').mockResolvedValue(true);
    });
    afterEach(() => {
      repoFindAllByUserStub.mockRestore();
      unlockStub.mockRestore();
      checkFirstSessionStub.mockRestore();
      getLongestStreakStub.mockRestore();
      checkFiftyPagesOneDayStub.mockRestore();
      checkTenBooksFinishedStub.mockRestore();
      checkConsistentReaderStub.mockRestore();
      vi.restoreAllMocks();
    });
    it('should unlock all achievements if user qualifies and has none unlocked', async () => {
      const result = await service.checkAndUnlockAchievements(userId, sessionData);
      // Should unlock FIRST_SESSION, STREAK_3, FIFTY_PAGES_ONE_DAY, TEN_BOOKS_FINISHED, CONSISTENT_READER
      expect(result).toEqual([
        { code: 'FIRST_SESSION', label: 'First Reading Session', userId },
        { code: 'STREAK_3', label: '3-Day Reading Streak', userId },
        { code: 'FIFTY_PAGES_ONE_DAY', label: 'Read 50 Pages in One Day', userId },
        { code: 'TEN_BOOKS_FINISHED', label: 'Finished 10 Books', userId },
        { code: 'CONSISTENT_READER', label: 'Consistent Reader (4 Weeks)', userId }
      ]);
      expect(unlockStub).toHaveBeenCalledTimes(5);
      expect(checkFirstSessionStub).toHaveBeenCalledWith(userId);
      expect(getLongestStreakStub).toHaveBeenCalledWith(userId);
      expect(checkFiftyPagesOneDayStub).toHaveBeenCalledWith(userId, sessionData);
      expect(checkTenBooksFinishedStub).toHaveBeenCalledWith(userId);
      expect(checkConsistentReaderStub).toHaveBeenCalledWith(userId);
    });
  });
});
