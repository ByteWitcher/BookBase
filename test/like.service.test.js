import { expect } from "chai";
import sinon from "sinon";
import likeService from "../src/services/like.service.js";
import likeRepository from "../src/repositories/like.repository.js";
import Book from "../src/entities/book.entity.js";

describe("LikeService", () => {
  // ============================================
  // toggleLike()
  // ============================================
  describe("toggleLike()", () => {
    afterEach(() => sinon.restore());

    it("throws if book not found", async () => {
      sinon.stub(Book, "findByPk").resolves(null);

      try {
        await likeService.toggleLike("user-1", "book-1");
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Book not found");
      }
    });

    it("throws if book is not visible", async () => {
      sinon.stub(Book, "findByPk").resolves({
        id: "book-1",
        isActive: false,
        addedById: "user-2",
      });

      try {
        await likeService.toggleLike("user-1", "book-1");
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Book is not available");
      }
    });

    it("throws if user tries to like their own book", async () => {
      sinon.stub(Book, "findByPk").resolves({
        id: "book-1",
        isActive: true,
        addedById: "user-1",
      });

      try {
        await likeService.toggleLike("user-1", "book-1");
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal("You cannot like your own book");
      }
    });

    it("adds like if not already liked", async () => {
      const updateStub = sinon.stub().resolves();

      sinon.stub(Book, "findByPk").resolves({
        id: "book-1",
        isActive: true,
        addedById: "user-2",
        update: updateStub,
      });

      sinon.stub(likeRepository, "isLiked").resolves(false);
      sinon
        .stub(likeRepository, "addLike")
        .resolves({ userId: "user-1", bookId: "book-1" });
      sinon.stub(likeRepository, "countBookLikes").resolves(5);

      const result = await likeService.toggleLike("user-1", "book-1");

      expect(result.liked).to.be.true;
      expect(result.totalLikes).to.equal(5);
      expect(updateStub.calledOnce).to.be.true;
    });

    it("removes like if already liked", async () => {
      const updateStub = sinon.stub().resolves();

      sinon.stub(Book, "findByPk").resolves({
        id: "book-1",
        isActive: true,
        addedById: "user-2",
        update: updateStub,
      });

      sinon.stub(likeRepository, "isLiked").resolves(true);
      sinon.stub(likeRepository, "removeLike").resolves(1);
      sinon.stub(likeRepository, "countBookLikes").resolves(4);

      const result = await likeService.toggleLike("user-1", "book-1");

      expect(result.liked).to.be.false;
      expect(result.totalLikes).to.equal(4);
    });
  });

  // ============================================
  // getBookLikes()
  // ============================================
  describe("getBookLikes()", () => {
    afterEach(() => sinon.restore());

    it("throws if book not found", async () => {
      sinon.stub(Book, "findByPk").resolves(null);

      try {
        await likeService.getBookLikes("book-1");
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Book not found");
      }
    });

    it("returns book likes successfully", async () => {
      sinon.stub(Book, "findByPk").resolves({ id: "book-1" });

      const fakeLikes = [
        { user: { id: "user-1", username: "user1" } },
        { user: { id: "user-2", username: "user2" } },
      ];

      sinon.stub(likeRepository, "getBookLikes").resolves(fakeLikes);

      const result = await likeService.getBookLikes("book-1");

      expect(result.users).to.have.lengthOf(2);
      expect(result.total).to.equal(2);
    });
  });
});
