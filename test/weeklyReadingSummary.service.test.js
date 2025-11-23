import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import WeeklyReadingSummaryService from '../src/services/weeklyReadingSummary.service.js';
import WeeklyReadingSummaryRepository from '../src/repositories/weeklyReadingSummary.repository.js';
import ReadingSessionRepository from '../src/repositories/readingSession.repository.js';

describe('WeeklyReadingSummaryService', () => {
  describe('createSummary', () => {
    let repoCreateStub;
    const fakeSummary = { id: 's1', userId: 'u1', weekStart: '2025-11-17', weekEnd: '2025-11-23' };
    beforeEach(() => {
      repoCreateStub = vi.spyOn(WeeklyReadingSummaryRepository, 'create').mockResolvedValue(fakeSummary);
    });

    afterEach(() => {
      repoCreateStub.mockRestore();
      vi.restoreAllMocks();
    });
    it('should create a summary', async () => {
      const result = await WeeklyReadingSummaryService.createSummary(fakeSummary);
      expect(result).toEqual(fakeSummary);
      expect(repoCreateStub).toHaveBeenCalledWith(fakeSummary);
    });
  });

  describe('getSummaryById', () => {
    let repoFindByIdStub;
    const fakeSummary = { id: 's1', userId: 'u1' };
    beforeEach(() => {
      repoFindByIdStub = vi.spyOn(WeeklyReadingSummaryRepository, 'findById').mockResolvedValue(fakeSummary);
    });
    afterEach(() => {
      repoFindByIdStub.mockRestore();
      vi.restoreAllMocks();
    });
    it('should return the summary by id', async () => {
      const result = await WeeklyReadingSummaryService.getSummaryById('s1');
      expect(result).toEqual(fakeSummary);
      expect(repoFindByIdStub).toHaveBeenCalledWith('s1');
    });
  });

  describe('updateSummary', () => {
    let repoUpdateStub;
    const fakeSummary = { id: 's1', totalPagesRead: 100 };
    beforeEach(() => {
      repoUpdateStub = vi.spyOn(WeeklyReadingSummaryRepository, 'update').mockResolvedValue(fakeSummary);
    });
    afterEach(() => {
      repoUpdateStub.mockRestore();
      vi.restoreAllMocks();
    });
    it('should update the summary', async () => {
      const result = await WeeklyReadingSummaryService.updateSummary('s1', { totalPagesRead: 100 });
      expect(result).toEqual(fakeSummary);
      expect(repoUpdateStub).toHaveBeenCalledWith('s1', { totalPagesRead: 100 });
    });
  });

  describe('deleteSummary', () => {
    let repoDeleteStub;
    beforeEach(() => {
      repoDeleteStub = vi.spyOn(WeeklyReadingSummaryRepository, 'delete').mockResolvedValue(true);
    });
    afterEach(() => {
      repoDeleteStub.mockRestore();
      vi.restoreAllMocks();
    });
    it('should delete the summary by id', async () => {
      const result = await WeeklyReadingSummaryService.deleteSummary('s1');
      expect(result).toBe(true);
      expect(repoDeleteStub).toHaveBeenCalledWith('s1');
    });
  });

  describe('getAllSummariesByUser', () => {
    let repoFindAllByUserStub;
    const fakeSummaries = [
      { id: 's1', userId: 'u1' },
      { id: 's2', userId: 'u1' }
    ];
    beforeEach(() => {
      repoFindAllByUserStub = vi.spyOn(WeeklyReadingSummaryRepository, 'findAllByUser').mockResolvedValue(fakeSummaries);
    });
    afterEach(() => {
      repoFindAllByUserStub.mockRestore();
      vi.restoreAllMocks();
    });
    it('should return all summaries for a user', async () => {
      const result = await WeeklyReadingSummaryService.getAllSummariesByUser('u1');
      expect(result).toEqual(fakeSummaries);
      expect(repoFindAllByUserStub).toHaveBeenCalledWith('u1');
    });
  });

  describe('getAllSummaries', () => {
    let repoFindAllStub;
    const fakeSummaries = [
      { id: 's1', userId: 'u1' },
      { id: 's2', userId: 'u2' }
    ];
    beforeEach(() => {
      repoFindAllStub = vi.spyOn(WeeklyReadingSummaryRepository, 'findAll').mockResolvedValue(fakeSummaries);
    });
    afterEach(() => {
      repoFindAllStub.mockRestore();
      vi.restoreAllMocks();
    });
    it('should return all summaries with options', async () => {
      const result = await WeeklyReadingSummaryService.getAllSummaries({ where: { userId: 'u1' } });
      expect(result).toEqual(fakeSummaries);
      expect(repoFindAllStub).toHaveBeenCalledWith({ where: { userId: 'u1' } });
    });
  });

    describe('generateSummaryFromSessions', () => {
        let sessionRepoStub, findByWeekStub, createStub, updateStub;
        const userId = 'u1';
        const weekStart = '2025-11-17T00:00:00Z';
        const weekEnd = '2025-11-23T23:59:59Z';
        const sessions = [
            {
            startTime: '2025-11-18T10:00:00Z',
            endTime: '2025-11-18T11:00:00Z',
            startPage: 1,
            endPage: 21
            },
            {
            startTime: '2025-11-19T12:00:00Z',
            endTime: '2025-11-19T12:30:00Z',
            startPage: 21,
            endPage: 31
            }
        ];
        beforeEach(() => {
            // Mock ReadingSessionRepository
            sessionRepoStub = vi.spyOn(ReadingSessionRepository, 'findAllByUser').mockResolvedValue(sessions);
            // Mock WeeklyReadingSummaryRepository
            findByWeekStub = vi.spyOn(WeeklyReadingSummaryRepository, 'findByWeekForUser');
            createStub = vi.spyOn(WeeklyReadingSummaryRepository, 'create');
            updateStub = vi.spyOn(WeeklyReadingSummaryRepository, 'update');
        });
        afterEach(() => {
            sessionRepoStub.mockRestore();
            findByWeekStub.mockRestore();
            createStub.mockRestore();
            updateStub.mockRestore();
            vi.restoreAllMocks();
        });

        it('should create a new summary if none exists', async () => {
            findByWeekStub.mockResolvedValue(null);
            createStub.mockImplementation(async (data) => ({ ...data, id: 'summary1' }));
            const result = await WeeklyReadingSummaryService.generateSummaryFromSessions(userId, weekStart, weekEnd);
            expect(result).toMatchObject({
            userId,
            weekStart,
            weekEnd,
            totalReadingMinutes: 90,
            totalPagesRead: 30,
            averageSpeed: expect.any(Number)
            });
            expect(createStub).toHaveBeenCalled();
            expect(updateStub).not.toHaveBeenCalled();
        });

        it('should update an existing summary if found', async () => {
            findByWeekStub.mockResolvedValue({ id: 'summary1' });
            updateStub.mockImplementation(async (id, updates) => ({ id, ...updates }));
            const result = await WeeklyReadingSummaryService.generateSummaryFromSessions(userId, weekStart, weekEnd);
            expect(result).toMatchObject({
            id: 'summary1',
            totalReadingMinutes: 90,
            totalPagesRead: 30,
            averageSpeed: expect.any(Number)
            });
            expect(updateStub).toHaveBeenCalledWith('summary1', expect.objectContaining({ totalReadingMinutes: 90 }));
            expect(createStub).not.toHaveBeenCalled();
        });
    });
});
