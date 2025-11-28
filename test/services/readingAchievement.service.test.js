import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import sinonChai from "sinon-chai";
import sinon from "sinon";
import WeeklyReadingSummaryRepository from "../../src/repositories/weeklyReadingSummary.repository.js";
import ReadingSessionRepository from "../../src/repositories/readingSession.repository.js";
import ReadingAchievementService from "../../src/services/readingAchievement.service.js";
import ReadingAchievementRepository from "../../src/repositories/readingAchievement.repository.js";

// Configure Chai plugins
chai.use(chaiAsPromised);
chai.use(sinonChai);

const { expect } = chai;

describe("ReadingAchievementService", () => {
  describe("getAchievements", () => {
    let repoFindAllStub;
    const fakeAchievements = [
      { id: "a1", code: "FIRST_SESSION", userId: "u1" },
      { id: "a2", code: "STREAK_3", userId: "u2" },
    ];
    beforeEach(() => {
      repoFindAllStub = sinon
        .stub(ReadingAchievementRepository, "findAll")
        .resolves(fakeAchievements);
    });
    afterEach(() => {
      sinon.restore();
    });
    it("should return all achievements with options", async () => {
      const result = await ReadingAchievementService.getAchievements({
        where: { code: "FIRST_SESSION" },
      });
      expect(result).to.deep.equal(fakeAchievements);
      expect(repoFindAllStub).to.have.been.calledWith({
        where: { code: "FIRST_SESSION" },
      });
    });
  });

  describe("getAchievementsByUser", () => {
    let repoFindAllByUserStub;
    const fakeAchievements = [
      { id: "a1", code: "FIRST_SESSION", userId: "u1" },
    ];
    beforeEach(() => {
      repoFindAllByUserStub = sinon
        .stub(ReadingAchievementRepository, "findAllByUser")
        .resolves(fakeAchievements);
    });
    afterEach(() => {
      sinon.restore();
    });
    it("should return all achievements for a user", async () => {
      const result =
        await ReadingAchievementService.getAchievementsByUser("u1");
      expect(result).to.deep.equal(fakeAchievements);
      expect(repoFindAllByUserStub).to.have.been.calledWith("u1");
    });
  });

  describe("getAchievementById", () => {
    let repoFindByIdStub;
    const fakeAchievement = { id: "a1", code: "FIRST_SESSION", userId: "u1" };
    beforeEach(() => {
      repoFindByIdStub = sinon
        .stub(ReadingAchievementRepository, "findById")
        .resolves(fakeAchievement);
    });
    afterEach(() => {
      sinon.restore();
    });
    it("should return the achievement by id", async () => {
      const result = await ReadingAchievementService.getAchievementById("a1");
      expect(result).to.deep.equal(fakeAchievement);
      expect(repoFindByIdStub).to.have.been.calledWith("a1");
    });
  });

  describe("deleteAchievement", () => {
    let repoDeleteStub;
    beforeEach(() => {
      repoDeleteStub = sinon
        .stub(ReadingAchievementRepository, "delete")
        .resolves(true);
    });
    afterEach(() => {
      sinon.restore();
    });
    it("should delete the achievement by id", async () => {
      const result = await ReadingAchievementService.deleteAchievement("a1");
      expect(result).to.equal(true);
      expect(repoDeleteStub).to.have.been.calledWith("a1");
    });
  });
  describe("checkFirstSession", () => {
    let repoFindAllStub;
    const service = ReadingAchievementService;
    beforeEach(() => {
      repoFindAllStub = sinon.stub(ReadingSessionRepository, "findAllByUser");
    });
    afterEach(() => {
      sinon.restore();
    });
    it("should return true if user has exactly one session", async () => {
      repoFindAllStub.resolves([{ id: "s1" }]);
      const result = await service.checkFirstSession("u1");
      expect(result).to.equal(true);
      expect(repoFindAllStub).to.have.been.calledWith("u1");
    });
    it("should return false if user has zero or more than one session", async () => {
      repoFindAllStub.resolves([]);
      expect(await service.checkFirstSession("u1")).to.equal(false);
      repoFindAllStub.resolves([{ id: "s1" }, { id: "s2" }]);
      expect(await service.checkFirstSession("u1")).to.equal(false);
    });
  });

  describe("checkConsistentReader", () => {
    let repoFindAllStub;
    const service = ReadingAchievementService;
    beforeEach(() => {
      repoFindAllStub = sinon.stub(
        WeeklyReadingSummaryRepository,
        "findAllByUser",
      );
    });
    afterEach(() => {
      sinon.restore();
    });
    it("should return true if user has 4 consecutive weeks", async () => {
      // 4 consecutive Mondays
      const weeks = [
        { weekStart: "2025-11-03" },
        { weekStart: "2025-11-10" },
        { weekStart: "2025-11-17" },
        { weekStart: "2025-11-24" },
      ];
      repoFindAllStub.resolves(weeks);
      expect(await service.checkConsistentReader("u1")).to.equal(true);
    });
    it("should return false if user does not have 4 consecutive weeks", async () => {
      const weeks = [
        { weekStart: "2025-11-03" },
        { weekStart: "2025-11-17" },
        { weekStart: "2025-11-24" },
        { weekStart: "2025-12-01" },
      ];
      repoFindAllStub.resolves(weeks);
      expect(await service.checkConsistentReader("u1")).to.equal(false);
    });
  });

  describe("checkFiftyPagesOneDay", () => {
    let repoFindAllStub;
    const service = ReadingAchievementService;
    const sessionData = { startTime: "2025-11-22T10:00:00Z" };
    beforeEach(() => {
      repoFindAllStub = sinon.stub(ReadingSessionRepository, "findAllByUser");
    });
    afterEach(() => {
      sinon.restore();
    });
    it("should return true if user read 50+ pages in one day", async () => {
      const sessions = [
        { startTime: "2025-11-22T09:00:00Z", startPage: 1, endPage: 30 },
        { startTime: "2025-11-22T15:00:00Z", startPage: 30, endPage: 51 },
      ];
      repoFindAllStub.resolves(sessions);
      expect(await service.checkFiftyPagesOneDay("u1", sessionData)).to.equal(
        true,
      );
    });
    it("should return false if user read less than 50 pages in one day", async () => {
      const sessions = [
        { startTime: "2025-11-22T09:00:00Z", startPage: 1, endPage: 20 },
        { startTime: "2025-11-22T15:00:00Z", startPage: 20, endPage: 40 },
      ];
      repoFindAllStub.resolves(sessions);
      expect(await service.checkFiftyPagesOneDay("u1", sessionData)).to.equal(
        false,
      );
    });
  });

  describe("checkTenBooksFinished", () => {
    let repoFindAllStub, bookFindStub;
    const service = ReadingAchievementService;
    // Dynamically import Book model for mocking
    let Book;
    before(async () => {
      Book = (await import("../../src/entities/index.js")).default.Book;
    });
    beforeEach(() => {
      repoFindAllStub = sinon.stub(ReadingSessionRepository, "findAllByUser");
      bookFindStub = sinon.stub(Book, "findByPk");
    });
    afterEach(() => {
      sinon.restore();
    });
    it("should return true if user finished 10 or more books", async () => {
      const sessions = Array.from({ length: 10 }, (_, i) => ({
        bookId: `b${i + 1}`,
        endPage: 100,
      }));
      repoFindAllStub.resolves(sessions);
      // All books have 100 pages
      bookFindStub.callsFake(async (id) => ({ id, pageCount: 100 }));
      expect(await service.checkTenBooksFinished("u1")).to.equal(true);
    });
    it("should return false if user finished less than 10 books", async () => {
      const sessions = Array.from({ length: 9 }, (_, i) => ({
        bookId: `b${i + 1}`,
        endPage: 100,
      }));
      repoFindAllStub.resolves(sessions);
      bookFindStub.callsFake(async (id) => ({ id, pageCount: 100 }));
      expect(await service.checkTenBooksFinished("u1")).to.equal(false);
    });
    it("should not count unfinished books", async () => {
      const sessions = [
        { bookId: "b1", endPage: 100 },
        { bookId: "b2", endPage: 50 }, // not finished
        { bookId: "b3", endPage: 100 },
        { bookId: "b4", endPage: 100 },
        { bookId: "b5", endPage: 100 },
        { bookId: "b6", endPage: 100 },
        { bookId: "b7", endPage: 100 },
        { bookId: "b8", endPage: 100 },
        { bookId: "b9", endPage: 100 },
        { bookId: "b10", endPage: 100 },
      ];
      repoFindAllStub.resolves(sessions);
      // Only b2 is unfinished
      bookFindStub.callsFake(async (id) => ({ id, pageCount: 100 }));
      expect(await service.checkTenBooksFinished("u1")).to.equal(false);
      // Now, make all finished
      const sessions2 = sessions.map((s, i) => ({ ...s, endPage: 100 }));
      repoFindAllStub.resolves(sessions2);
      bookFindStub.callsFake(async (id) => ({ id, pageCount: 100 }));
      expect(await service.checkTenBooksFinished("u1")).to.equal(true);
    });
  });
  describe("getLongestStreak", () => {
    let repoFindAllStub;
    const service = ReadingAchievementService;
    beforeEach(() => {
      repoFindAllStub = sinon.stub(ReadingSessionRepository, "findAllByUser");
    });
    afterEach(() => {
      sinon.restore();
    });
    it("should return 3 for a user with a 3-day streak and a 2-day streak", async () => {
      // 2-day streak: 2025-11-01, 2025-11-02
      // 3-day streak: 2025-11-10, 2025-11-11, 2025-11-12
      const sessions = [
        { startTime: "2025-11-01T10:00:00Z" },
        { startTime: "2025-11-02T10:00:00Z" },
        { startTime: "2025-11-10T10:00:00Z" },
        { startTime: "2025-11-11T10:00:00Z" },
        { startTime: "2025-11-12T10:00:00Z" },
      ];
      repoFindAllStub.resolves(sessions);
      const result = await service.getLongestStreak("u1");
      expect(result).to.equal(3);
    });
  });
  describe("checkAndUnlockAchievements", () => {
    let repoFindAllByUserStub,
      unlockStub,
      checkFirstSessionStub,
      getLongestStreakStub,
      checkFiftyPagesOneDayStub,
      checkTenBooksFinishedStub,
      checkConsistentReaderStub;
    const service = ReadingAchievementService;
    const userId = "u1";
    const sessionData = { startTime: "2025-11-22T10:00:00Z" };
    beforeEach(() => {
      repoFindAllByUserStub = sinon
        .stub(ReadingAchievementRepository, "findAllByUser")
        .resolves([]);
      unlockStub = sinon
        .stub(service, "unlock")
        .callsFake(async (uid, ach) => ({ ...ach, userId: uid }));
      checkFirstSessionStub = sinon
        .stub(service, "checkFirstSession")
        .resolves(true);
      getLongestStreakStub = sinon
        .stub(service, "getLongestStreak")
        .resolves(3);
      checkFiftyPagesOneDayStub = sinon
        .stub(service, "checkFiftyPagesOneDay")
        .resolves(true);
      checkTenBooksFinishedStub = sinon
        .stub(service, "checkTenBooksFinished")
        .resolves(true);
      checkConsistentReaderStub = sinon
        .stub(service, "checkConsistentReader")
        .resolves(true);
    });
    afterEach(() => {
      sinon.restore();
    });
    it("should unlock all achievements if user qualifies and has none unlocked", async () => {
      const result = await service.checkAndUnlockAchievements(
        userId,
        sessionData,
      );
      // Should unlock FIRST_SESSION, STREAK_3, FIFTY_PAGES_ONE_DAY, TEN_BOOKS_FINISHED, CONSISTENT_READER
      expect(result).to.deep.equal([
        { code: "FIRST_SESSION", label: "First Reading Session", userId },
        { code: "STREAK_3", label: "3-Day Reading Streak", userId },
        {
          code: "FIFTY_PAGES_ONE_DAY",
          label: "Read 50 Pages in One Day",
          userId,
        },
        { code: "TEN_BOOKS_FINISHED", label: "Finished 10 Books", userId },
        {
          code: "CONSISTENT_READER",
          label: "Consistent Reader (4 Weeks)",
          userId,
        },
      ]);
      expect(unlockStub).to.have.callCount(5);
      expect(checkFirstSessionStub).to.have.been.calledWith(userId);
      expect(getLongestStreakStub).to.have.been.calledWith(userId);
      expect(checkFiftyPagesOneDayStub).to.have.been.calledWith(
        userId,
        sessionData,
      );
      expect(checkTenBooksFinishedStub).to.have.been.calledWith(userId);
      expect(checkConsistentReaderStub).to.have.been.calledWith(userId);
    });
  });
});
