import { expect } from "chai";
import sinon from "sinon";
import bookRequestService from "../../src/services/book-request.service.js";
import bookRequestRepository from "../../src/repositories/book-request.repositroy.js";
import bookService from "../../src/services/book.service.js";
import HttpError from "../../src/utils/http-error.util.js";

describe("BookRequestService", () => {
  afterEach(() => sinon.restore());

  describe("createBookRequest()", () => {
    it("creates a book request successfully", async () => {
      const fakeBook = { id: "b1", title: "Book 1" };
      const createdBookRequest = {
        id: "r1",
        toJSON: () => ({ id: "r1", bookId: "b1" }),
      };

      sinon.stub(bookService, "createBook").resolves(fakeBook);
      sinon.stub(bookRequestRepository, "create").resolves(createdBookRequest);

      const result = await bookRequestService.createBookRequest("u1", {
        title: "Book 1",
      });

      expect(result.book).to.deep.equal(fakeBook);
      expect(result.id).to.equal("r1");
    });
  });

  describe("getBookRequestById()", () => {
    it("throws if not found", async () => {
      sinon.stub(bookRequestRepository, "findById").resolves(null);

      try {
        await bookRequestService.getBookRequestById(
          { role: "USER", id: "u1" },
          "r1",
        );
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Book request not found");
      }
    });

    it("throws if user is not admin and not owner", async () => {
      sinon.stub(bookRequestRepository, "findById").resolves({ userId: "u2" });

      try {
        await bookRequestService.getBookRequestById(
          { role: "USER", id: "u1" },
          "r1",
        );
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal(
          "You are not allowed to view this book request",
        );
      }
    });

    it("returns book request for admin", async () => {
      const fakeRequest = { id: "r1", userId: "u2" };
      sinon.stub(bookRequestRepository, "findById").resolves(fakeRequest);

      const result = await bookRequestService.getBookRequestById(
        { role: "ADMIN", id: "admin1" },
        "r1",
      );
      expect(result).to.equal(fakeRequest);
    });

    it("returns book request for owner", async () => {
      const fakeRequest = { id: "r1", userId: "u1" };
      sinon.stub(bookRequestRepository, "findById").resolves(fakeRequest);

      const result = await bookRequestService.getBookRequestById(
        { role: "USER", id: "u1" },
        "r1",
      );
      expect(result).to.equal(fakeRequest);
    });
  });

  describe("getBookRequestsFiltered()", () => {
    it("returns paginated results", async () => {
      const fakeRows = [{ id: "r1" }, { id: "r2" }];
      sinon
        .stub(bookRequestRepository, "findFiltered")
        .resolves({ count: 2, rows: fakeRows });

      const result = await bookRequestService.getBookRequestsFiltered(
        { role: "ADMIN" },
        { page: 1, pageSize: 10 },
      );

      expect(result.totalItems).to.equal(2);
      expect(result.data).to.deep.equal(fakeRows);
    });
  });

  describe("updateBookRequest()", () => {
    it("throws if not found", async () => {
      sinon.stub(bookRequestRepository, "findById").resolves(null);

      try {
        await bookRequestService.updateBookRequest("u1", "r1", {
          comment: "ok",
        });
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Book request not found");
      }
    });

    it("updates comment only", async () => {
      const fakeRequest = {
        id: "r1",
        status: "PENDING",
        comment: "old",
        update: async function (updates) {
          Object.assign(this, updates);
          return this;
        },
      };
      sinon.stub(bookRequestRepository, "findById").resolves(fakeRequest);

      const result = await bookRequestService.updateBookRequest("u1", "r1", {
        comment: "new comment",
      });

      expect(result.comment).to.equal("new comment");
      expect(result.status).to.equal("PENDING");
    });

    it("approves a request", async () => {
      const fakeRequest = {
        id: "r1",
        status: "PENDING",
        bookId: "b1",
        update: async function (updates) {
          Object.assign(this, updates);
          return this;
        },
      };
      sinon.stub(bookRequestRepository, "findById").resolves(fakeRequest);
      const activateStub = sinon.stub(bookService, "activateBook").resolves();

      const result = await bookRequestService.updateBookRequest(
        "admin1",
        "r1",
        { status: "APPROVED" },
      );

      expect(result.status).to.equal("APPROVED");
      expect(result.adminId).to.equal("admin1");
      expect(activateStub.calledOnceWith("admin1", "b1")).to.be.true;
    });

    it("rejects a request", async () => {
      const fakeRequest = {
        id: "r1",
        status: "PENDING",
        bookId: "b1",
        update: async function (updates) {
          Object.assign(this, updates);
          return this;
        },
      };
      sinon.stub(bookRequestRepository, "findById").resolves(fakeRequest);
      const deleteStub = sinon.stub(bookService, "deleteBookById").resolves();

      const result = await bookRequestService.updateBookRequest(
        "admin1",
        "r1",
        { status: "REJECTED" },
      );

      expect(result.status).to.equal("REJECTED");
      expect(result.adminId).to.equal("admin1");
      expect(deleteStub.calledOnceWith("b1")).to.be.true;
    });
  });

  describe("updateBookRequestWithBookAttributes()", () => {
    it("updates book attributes", async () => {
      const fakeRequest = {
        id: "r1",
        update: async function (updates) {
          Object.assign(this, updates);
          return this;
        },
      };

      await bookRequestService.updateBookRequestWithBookAttributes(
        fakeRequest,
        { title: "New Book" },
      );
      expect(fakeRequest.title).to.equal("New Book");
      expect(fakeRequest.bookId).to.be.null;
    });
  });

  describe("deleteBookRequestById()", () => {
    it("throws if not found", async () => {
      sinon.stub(bookRequestRepository, "findById").resolves(null);

      try {
        await bookRequestService.deleteBookRequestById("r1");
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Book request not found");
      }
    });

    it("throws if book still exists", async () => {
      sinon
        .stub(bookRequestRepository, "findById")
        .resolves({ id: "r1", bookId: "b1" });

      try {
        await bookRequestService.deleteBookRequestById("r1");
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Book still exists");
      }
    });

    it("deletes successfully", async () => {
      sinon
        .stub(bookRequestRepository, "findById")
        .resolves({ id: "r1", bookId: null });
      const deleteStub = sinon
        .stub(bookRequestRepository, "deleteById")
        .resolves();

      await bookRequestService.deleteBookRequestById("r1");

      expect(deleteStub.calledOnceWith("r1")).to.be.true;
    });
  });
});
