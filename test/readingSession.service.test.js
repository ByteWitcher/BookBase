import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as readingSessionServiceModule from '../src/services/readingSession.service.js';
import ReadingSessionRepository from '../src/repositories/readingSession.repository.js';
import models from '../src/entities/index.js';

describe('validateSessionInput', () => {
  // Get the function from the imported module
  const validateSessionInput = readingSessionServiceModule.validateSessionInput || readingSessionServiceModule.default?.validateSessionInput;

  it('should throw if book is missing', () => {
    expect(() => validateSessionInput({ book: null, startPage: 1, endPage: 10, startTime: '2025-11-22T10:00:00Z', endTime: '2025-11-22T11:00:00Z' }))
      .to.throw('Book not found');
  });

  it('should throw if startPage < 1', () => {
    expect(() => validateSessionInput({ book: { pageNumbers: 100 }, startPage: 0, endPage: 10, startTime: '2025-11-22T10:00:00Z', endTime: '2025-11-22T11:00:00Z' }))
      .to.throw('Invalid page range for this book');
  });

  it('should throw if endPage > book.pageNumbers', () => {
    expect(() => validateSessionInput({ book: { pageNumbers: 100 }, startPage: 1, endPage: 101, startTime: '2025-11-22T10:00:00Z', endTime: '2025-11-22T11:00:00Z' }))
      .to.throw('Invalid page range for this book');
  });

  it('should throw if startPage > endPage', () => {
    expect(() => validateSessionInput({ book: { pageNumbers: 100 }, startPage: 20, endPage: 10, startTime: '2025-11-22T10:00:00Z', endTime: '2025-11-22T11:00:00Z' }))
      .to.throw('Invalid page range for this book');
  });

  it('should throw if startTime or endTime is missing', () => {
    expect(() => validateSessionInput({ book: { pageNumbers: 100 }, startPage: 1, endPage: 10, startTime: null, endTime: '2025-11-22T11:00:00Z' }))
      .to.throw('Start and end time are required');
    expect(() => validateSessionInput({ book: { pageNumbers: 100 }, startPage: 1, endPage: 10, startTime: '2025-11-22T10:00:00Z', endTime: null }))
      .to.throw('Start and end time are required');
  });

  it('should throw if startTime or endTime is invalid date', () => {
    expect(() => validateSessionInput({ book: { pageNumbers: 100 }, startPage: 1, endPage: 10, startTime: 'invalid', endTime: '2025-11-22T11:00:00Z' }))
      .to.throw('Invalid date format');
    expect(() => validateSessionInput({ book: { pageNumbers: 100 }, startPage: 1, endPage: 10, startTime: '2025-11-22T10:00:00Z', endTime: 'invalid' }))
      .to.throw('Invalid date format');
  });

  it('should throw if endTime <= startTime', () => {
    expect(() => validateSessionInput({ book: { pageNumbers: 100 }, startPage: 1, endPage: 10, startTime: '2025-11-22T11:00:00Z', endTime: '2025-11-22T10:00:00Z' }))
      .to.throw('End time must be after start time');
    expect(() => validateSessionInput({ book: { pageNumbers: 100 }, startPage: 1, endPage: 10, startTime: '2025-11-22T10:00:00Z', endTime: '2025-11-22T10:00:00Z' }))
      .to.throw('End time must be after start time');
  });

  it('should not throw for valid input', () => {
    expect(() => validateSessionInput({ book: { pageNumbers: 100 }, startPage: 1, endPage: 10, startTime: '2025-11-22T10:00:00Z', endTime: '2025-11-22T11:00:00Z' }))
      .to.not.throw();
  });
});

describe('createSession', () => {
    let bookStub;
    const fakeSession = {
      id: 'session1',
      userId: 'user1',
      bookId: 'book1',
      startTime: new Date('2025-11-22T10:00:00Z'),
      endTime: new Date('2025-11-22T11:00:00Z'),
      startPage: 1,
      endPage: 10
    };
    beforeEach(() => {
      bookStub = vi.spyOn(models.Book, 'findByPk');
    });
    afterEach(() => {
      bookStub.mockRestore();
      vi.restoreAllMocks();
    });

    it('should create a session if input is valid', async () => {
      bookStub.mockResolvedValue({ id: 'book1', pageNumbers: 200 });
      // Mock the repository create method
      const repoCreate = vi.spyOn(ReadingSessionRepository, 'create').mockResolvedValue(fakeSession);
      const result = await readingSessionServiceModule.default.createSession({
        userId: 'user1',
        bookId: 'book1',
        startTime: '2025-11-22T10:00:00Z',
        endTime: '2025-11-22T11:00:00Z',
        startPage: 1,
        endPage: 10
      });
      expect(result).toEqual(fakeSession);
      expect(bookStub).toHaveBeenCalledWith('book1');
      expect(repoCreate).toHaveBeenCalled();
      repoCreate.mockRestore();
    });
});

describe('updateSession', () => {
  let bookStub, repoFindStub, repoUpdateStub;
  const ReadingSessionService = readingSessionServiceModule.default;
  const fakeSession = {
    id: 'session1',
    userId: 'user1',
    bookId: 'book1',
    startTime: '2025-11-22T10:00:00Z',
    endTime: '2025-11-22T11:00:00Z',
    startPage: 1,
    endPage: 10
  };
  beforeEach(() => {
    repoFindStub = vi.spyOn(ReadingSessionRepository, 'findById').mockResolvedValue(fakeSession);
    bookStub = vi.spyOn(models.Book, 'findByPk').mockResolvedValue({ id: 'book1', pageNumbers: 200 });
    repoUpdateStub = vi.spyOn(ReadingSessionRepository, 'update').mockResolvedValue({ ...fakeSession, startPage: 2 });
  });
  afterEach(() => {
    repoFindStub.mockRestore();
    bookStub.mockRestore();
    repoUpdateStub.mockRestore();
    vi.restoreAllMocks();
  });

  it('should update a session if input is valid', async () => {
    const result = await ReadingSessionService.updateSession('session1', { startPage: 2 });
    expect(result).toEqual({ ...fakeSession, startPage: 2 });
    expect(repoFindStub).toHaveBeenCalledWith('session1');
    expect(bookStub).toHaveBeenCalledWith('book1');
    expect(repoUpdateStub).toHaveBeenCalled();
  });

  it('should throw if session not found', async () => {
    repoFindStub.mockResolvedValueOnce(null);
    await expect(ReadingSessionService.updateSession('badid', { startPage: 2 })).rejects.toThrow('Session not found');
  });
});

describe('deleteSession', () => {
  let repoDeleteStub;
  const ReadingSessionService = readingSessionServiceModule.default;
  beforeEach(() => {
    repoDeleteStub = vi.spyOn(ReadingSessionRepository, 'delete').mockResolvedValue(true);
  });
  afterEach(() => {
    repoDeleteStub.mockRestore();
    vi.restoreAllMocks();
  });

  it('should call repository delete and return result', async () => {
    const result = await ReadingSessionService.deleteSession('session1');
    expect(result).toBe(true);
    expect(repoDeleteStub).toHaveBeenCalledWith('session1');
  });
});

describe('getSessionById', () => {
  let repoFindStub;
  const ReadingSessionService = readingSessionServiceModule.default;
  beforeEach(() => {
    repoFindStub = vi.spyOn(ReadingSessionRepository, 'findById').mockResolvedValue({ id: 'session1' });
  });
  afterEach(() => {
    repoFindStub.mockRestore();
    vi.restoreAllMocks();
  });

  it('should return the session if found', async () => {
    const result = await ReadingSessionService.getSessionById('session1');
    expect(result).toEqual({ id: 'session1' });
    expect(repoFindStub).toHaveBeenCalledWith('session1');
  });
});

describe('getAllSessionsByUser', () => {
  let repoFindAllStub;
  const ReadingSessionService = readingSessionServiceModule.default;
  const fakeSessions = [
    { id: 'session1', userId: 'user1', bookId: 'book1' },
    { id: 'session2', userId: 'user1', bookId: 'book2' }
  ];
  beforeEach(() => {
    repoFindAllStub = vi.spyOn(ReadingSessionRepository, 'findAllByUser').mockResolvedValue(fakeSessions);
  });
  afterEach(() => {
    repoFindAllStub.mockRestore();
    vi.restoreAllMocks();
  });

  it('should return all sessions for a user', async () => {
    const result = await ReadingSessionService.getAllSessionsByUser('user1');
    expect(result).toEqual(fakeSessions);
    expect(repoFindAllStub).toHaveBeenCalledWith('user1');
  });
});

describe('getLatestSessionByUserAndBook', () => {
  let repoFindAllStub;
  const ReadingSessionService = readingSessionServiceModule.default;
  const fakeSessions = [
    { id: 'session1', userId: 'user1', bookId: 'book1', endTime: '2025-11-22T10:00:00Z' },
    { id: 'session2', userId: 'user1', bookId: 'book1', endTime: '2025-11-22T12:00:00Z' },
    { id: 'session3', userId: 'user1', bookId: 'book2', endTime: '2025-11-22T11:00:00Z' }
  ];
  beforeEach(() => {
    repoFindAllStub = vi.spyOn(ReadingSessionRepository, 'findAllByUser').mockResolvedValue(fakeSessions);
  });
  afterEach(() => {
    repoFindAllStub.mockRestore();
    vi.restoreAllMocks();
  });

  it('should return the latest session for a user and book', async () => {
    const result = await ReadingSessionService.getLatestSessionByUserAndBook('user1', 'book1');
    expect(result).toEqual(fakeSessions[1]); // session2 is latest for book1
    expect(repoFindAllStub).toHaveBeenCalledWith('user1');
  });

  it('should return null if no session for the book', async () => {
    const result = await ReadingSessionService.getLatestSessionByUserAndBook('user1', 'book3');
    expect(result).toBeNull();
    expect(repoFindAllStub).toHaveBeenCalledWith('user1');
  });
});

describe('getUserBookProgress', () => {
  let repoFindAllStub, bookFindStub;
  const ReadingSessionService = readingSessionServiceModule.default;
  const fakeSessions = [
    { id: 'session1', userId: 'user1', bookId: 'book1', endPage: 10 },
    { id: 'session2', userId: 'user1', bookId: 'book1', endPage: 25 }, // farther than previous
    { id: 'session3', userId: 'user1', bookId: 'book2', endPage: 15 }
  ];
  const fakeBooks = {
    book1: { id: 'book1', title: 'Book One' },
    book2: { id: 'book2', title: 'Book Two' }
  };
  beforeEach(() => {
    repoFindAllStub = vi.spyOn(ReadingSessionRepository, 'findAllByUser').mockResolvedValue(fakeSessions);
    bookFindStub = vi.spyOn(models.Book, 'findByPk').mockImplementation(async (id) => fakeBooks[id]);
  });
  afterEach(() => {
    repoFindAllStub.mockRestore();
    bookFindStub.mockRestore();
    vi.restoreAllMocks();
  });

  it('should return farthest page for each book the user read', async () => {
    const result = await ReadingSessionService.getUserBookProgress('user1');
    expect(result).toEqual([
      { bookId: 'book1', title: 'Book One', farthestPage: 25 },
      { bookId: 'book2', title: 'Book Two', farthestPage: 15 }
    ]);
    expect(repoFindAllStub).toHaveBeenCalledWith('user1');
    expect(bookFindStub).toHaveBeenCalledWith('book1');
    expect(bookFindStub).toHaveBeenCalledWith('book2');
  });
});