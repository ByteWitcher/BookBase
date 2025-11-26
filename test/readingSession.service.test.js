import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import * as readingSessionServiceModule from '../src/services/readingSession.service.js';
import ReadingSessionRepository from '../src/repositories/readingSession.repository.js';
import models from '../src/entities/index.js';

// Configure Chai plugins
chai.use(chaiAsPromised);
chai.use(sinonChai);

const { expect } = chai;

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
      bookStub = sinon.stub(models.Book, 'findByPk');
    });
    afterEach(() => {
      sinon.restore();
    });

    it('should create a session if input is valid', async () => {
      bookStub.resolves({ id: 'book1', pageNumbers: 200 });
      // Mock the repository create method
      const repoCreate = sinon.stub(ReadingSessionRepository, 'create').resolves(fakeSession);
      const result = await readingSessionServiceModule.default.createSession({
        userId: 'user1',
        bookId: 'book1',
        startTime: '2025-11-22T10:00:00Z',
        endTime: '2025-11-22T11:00:00Z',
        startPage: 1,
        endPage: 10
      });
      expect(result).to.deep.equal(fakeSession);
      expect(bookStub).to.have.been.calledWith('book1');
      expect(repoCreate).to.have.been.called;
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
    repoFindStub = sinon.stub(ReadingSessionRepository, 'findById').resolves(fakeSession);
    bookStub = sinon.stub(models.Book, 'findByPk').resolves({ id: 'book1', pageNumbers: 200 });
    repoUpdateStub = sinon.stub(ReadingSessionRepository, 'update').resolves({ ...fakeSession, startPage: 2 });
  });
  afterEach(() => {
    sinon.restore();
  });

  it('should update a session if input is valid', async () => {
    const result = await ReadingSessionService.updateSession('session1', { startPage: 2 });
    expect(result).to.deep.equal({ ...fakeSession, startPage: 2 });
    expect(repoFindStub).to.have.been.calledWith('session1');
    expect(bookStub).to.have.been.calledWith('book1');
    expect(repoUpdateStub).to.have.been.called;
  });

  it('should throw if session not found', async () => {
    repoFindStub.onFirstCall().resolves(null);
    await expect(ReadingSessionService.updateSession('badid', { startPage: 2 })).to.be.rejectedWith('Session not found');
  });
});

describe('deleteSession', () => {
  let repoDeleteStub;
  const ReadingSessionService = readingSessionServiceModule.default;
  beforeEach(() => {
    repoDeleteStub = sinon.stub(ReadingSessionRepository, 'delete').resolves(true);
  });
  afterEach(() => {
    sinon.restore();
  });

  it('should call repository delete and return result', async () => {
    const result = await ReadingSessionService.deleteSession('session1');
    expect(result).to.equal(true);
    expect(repoDeleteStub).to.have.been.calledWith('session1');
  });
});

describe('getSessionById', () => {
  let repoFindStub;
  const ReadingSessionService = readingSessionServiceModule.default;
  beforeEach(() => {
    repoFindStub = sinon.stub(ReadingSessionRepository, 'findById').resolves({ id: 'session1' });
  });
  afterEach(() => {
    sinon.restore();
  });

  it('should return the session if found', async () => {
    const result = await ReadingSessionService.getSessionById('session1');
    expect(result).to.deep.equal({ id: 'session1' });
    expect(repoFindStub).to.have.been.calledWith('session1');
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
    repoFindAllStub = sinon.stub(ReadingSessionRepository, 'findAllByUser').resolves(fakeSessions);
  });
  afterEach(() => {
    sinon.restore();
  });

  it('should return all sessions for a user', async () => {
    const result = await ReadingSessionService.getAllSessionsByUser('user1');
    expect(result).to.deep.equal(fakeSessions);
    expect(repoFindAllStub).to.have.been.calledWith('user1');
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
    repoFindAllStub = sinon.stub(ReadingSessionRepository, 'findAllByUser').resolves(fakeSessions);
  });
  afterEach(() => {
    sinon.restore();
  });

  it('should return the latest session for a user and book', async () => {
    const result = await ReadingSessionService.getLatestSessionByUserAndBook('user1', 'book1');
    expect(result).to.deep.equal(fakeSessions[1]); // session2 is latest for book1
    expect(repoFindAllStub).to.have.been.calledWith('user1');
  });

  it('should return null if no session for the book', async () => {
    const result = await ReadingSessionService.getLatestSessionByUserAndBook('user1', 'book3');
    expect(result).to.be.null;
    expect(repoFindAllStub).to.have.been.calledWith('user1');
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
    repoFindAllStub = sinon.stub(ReadingSessionRepository, 'findAllByUser').resolves(fakeSessions);
    bookFindStub = sinon.stub(models.Book, 'findByPk').callsFake(async (id) => fakeBooks[id]);
  });
  afterEach(() => {
    sinon.restore();
  });

  it('should return farthest page for each book the user read', async () => {
    const result = await ReadingSessionService.getUserBookProgress('user1');
    expect(result).to.deep.equal([
      { bookId: 'book1', title: 'Book One', farthestPage: 25 },
      { bookId: 'book2', title: 'Book Two', farthestPage: 15 }
    ]);
    expect(repoFindAllStub).to.have.been.calledWith('user1');
    expect(bookFindStub).to.have.been.calledWith('book1');
    expect(bookFindStub).to.have.been.calledWith('book2');
  });
});