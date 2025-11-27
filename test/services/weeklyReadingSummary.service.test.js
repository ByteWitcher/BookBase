import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import sinonChai from "sinon-chai";
import sinon from "sinon";
import WeeklyReadingSummaryService from "../../src/services/weeklyReadingSummary.service.js";
import WeeklyReadingSummaryRepository from "../../src/repositories/weeklyReadingSummary.repository.js";
import ReadingSessionRepository from "../../src/repositories/readingSession.repository.js";

// Configure Chai plugins
chai.use(chaiAsPromised);
chai.use(sinonChai);

const { expect } = chai;

describe("WeeklyReadingSummaryService", () => {
  describe("createSummary", () => {
    let repoCreateStub;
    const fakeSummary = {
      id: "s1",
      userId: "u1",
      weekStart: "2025-11-17",
      weekEnd: "2025-11-23",
    };
    beforeEach(() => {
      repoCreateStub = sinon
        .stub(WeeklyReadingSummaryRepository, "create")
        .resolves(fakeSummary);
    });

    afterEach(() => {
      sinon.restore();
    });
    it("should create a summary", async () => {
      const result =
        await WeeklyReadingSummaryService.createSummary(fakeSummary);
      expect(result).to.deep.equal(fakeSummary);
      expect(repoCreateStub).to.have.been.calledWith(fakeSummary);
    });
  });

  describe("getSummaryById", () => {
    let repoFindByIdStub;
    const fakeSummary = { id: "s1", userId: "u1" };
    beforeEach(() => {
      repoFindByIdStub = sinon
        .stub(WeeklyReadingSummaryRepository, "findById")
        .resolves(fakeSummary);
    });
    afterEach(() => {
      sinon.restore();
    });
    it("should return the summary by id", async () => {
      const result = await WeeklyReadingSummaryService.getSummaryById("s1");
      expect(result).to.deep.equal(fakeSummary);
      expect(repoFindByIdStub).to.have.been.calledWith("s1");
    });
  });

  describe("updateSummary", () => {
    let repoUpdateStub;
    const fakeSummary = { id: "s1", totalPagesRead: 100 };
    beforeEach(() => {
      repoUpdateStub = sinon
        .stub(WeeklyReadingSummaryRepository, "update")
        .resolves(fakeSummary);
    });
    afterEach(() => {
      sinon.restore();
    });
    it("should update the summary", async () => {
      const result = await WeeklyReadingSummaryService.updateSummary("s1", {
        totalPagesRead: 100,
      });
      expect(result).to.deep.equal(fakeSummary);
      expect(repoUpdateStub).to.have.been.calledWith("s1", {
        totalPagesRead: 100,
      });
    });
  });

  describe("deleteSummary", () => {
    let repoDeleteStub;
    beforeEach(() => {
      repoDeleteStub = sinon
        .stub(WeeklyReadingSummaryRepository, "delete")
        .resolves(true);
    });
    afterEach(() => {
      sinon.restore();
    });
    it("should delete the summary by id", async () => {
      const result = await WeeklyReadingSummaryService.deleteSummary("s1");
      expect(result).to.equal(true);
      expect(repoDeleteStub).to.have.been.calledWith("s1");
    });
  });

  describe("getAllSummariesByUser", () => {
    let repoFindAllByUserStub;
    const fakeSummaries = [
      { id: "s1", userId: "u1" },
      { id: "s2", userId: "u1" },
    ];
    beforeEach(() => {
      repoFindAllByUserStub = sinon
        .stub(WeeklyReadingSummaryRepository, "findAllByUser")
        .resolves(fakeSummaries);
    });
    afterEach(() => {
      sinon.restore();
    });
    it("should return all summaries for a user", async () => {
      const result =
        await WeeklyReadingSummaryService.getAllSummariesByUser("u1");
      expect(result).to.deep.equal(fakeSummaries);
      expect(repoFindAllByUserStub).to.have.been.calledWith("u1");
    });
  });

  describe("getAllSummaries", () => {
    let repoFindAllStub;
    const fakeSummaries = [
      { id: "s1", userId: "u1" },
      { id: "s2", userId: "u2" },
    ];
    beforeEach(() => {
      repoFindAllStub = sinon
        .stub(WeeklyReadingSummaryRepository, "findAll")
        .resolves(fakeSummaries);
    });
    afterEach(() => {
      sinon.restore();
    });
    it("should return all summaries with options", async () => {
      const result = await WeeklyReadingSummaryService.getAllSummaries({
        where: { userId: "u1" },
      });
      expect(result).to.deep.equal(fakeSummaries);
      expect(repoFindAllStub).to.have.been.calledWith({
        where: { userId: "u1" },
      });
    });
  });

  describe("generateSummaryFromSessions", () => {
    let sessionRepoStub, findByWeekStub, createStub, updateStub;
    const userId = "u1";
    const weekStart = "2025-11-17T00:00:00Z";
    const weekEnd = "2025-11-23T23:59:59Z";
    const sessions = [
      {
        startTime: "2025-11-18T10:00:00Z",
        endTime: "2025-11-18T11:00:00Z",
        startPage: 1,
        endPage: 21,
      },
      {
        startTime: "2025-11-19T12:00:00Z",
        endTime: "2025-11-19T12:30:00Z",
        startPage: 21,
        endPage: 31,
      },
    ];
    beforeEach(() => {
      // Mock ReadingSessionRepository
      sessionRepoStub = sinon
        .stub(ReadingSessionRepository, "findAllByUser")
        .resolves(sessions);
      // Mock WeeklyReadingSummaryRepository
      findByWeekStub = sinon.stub(
        WeeklyReadingSummaryRepository,
        "findByWeekForUser",
      );
      createStub = sinon.stub(WeeklyReadingSummaryRepository, "create");
      updateStub = sinon.stub(WeeklyReadingSummaryRepository, "update");
    });
    afterEach(() => {
      sinon.restore();
    });

    it("should create a new summary if none exists", async () => {
      findByWeekStub.resolves(null);
      createStub.callsFake(async (data) => ({ ...data, id: "summary1" }));
      const result =
        await WeeklyReadingSummaryService.generateSummaryFromSessions(
          userId,
          weekStart,
          weekEnd,
        );
      expect(result).to.include({
        userId,
        weekStart,
        weekEnd,
        totalReadingMinutes: 90,
        totalPagesRead: 30,
      });
      expect(result.averageSpeed).to.be.a("number");
      expect(createStub).to.have.been.called;
      expect(updateStub).to.not.have.been.called;
    });

    it("should update an existing summary if found", async () => {
      findByWeekStub.resolves({ id: "summary1" });
      updateStub.callsFake(async (id, updates) => ({ id, ...updates }));
      const result =
        await WeeklyReadingSummaryService.generateSummaryFromSessions(
          userId,
          weekStart,
          weekEnd,
        );
      expect(result).to.include({
        id: "summary1",
        totalReadingMinutes: 90,
        totalPagesRead: 30,
      });
      expect(result.averageSpeed).to.be.a("number");
      expect(updateStub).to.have.been.calledWith(
        "summary1",
        sinon.match({ totalReadingMinutes: 90 }),
      );
      expect(createStub).to.not.have.been.called;
    });
  });
});
