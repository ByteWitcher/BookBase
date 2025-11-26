import { expect } from "chai";
import sinon from "sinon";
import bookGenreService from "../../src/services/book-genre.service.js";
import bookGenreRepository from "../../src/repositories/book-genre.repository.js";
import bookService from "../../src/services/book.service.js";
import HttpError from "../../src/utils/http-error.util.js";

describe("BookGenreService", () => {
  afterEach(() => sinon.restore());

  describe("createBookGenre()", () => {
    it("throws if code already exists", async () => {
      sinon.stub(bookGenreRepository, "findByCode").resolves({ id: "1" });
      sinon.stub(bookGenreRepository, "findByName").resolves(null);

      try {
        await bookGenreService.createBookGenre({
          code: "FIC",
          name: "Fiction",
          description: "desc",
        });
        throw new Error("Expected error");
      } catch (err) {
        expect(err).to.be.instanceOf(HttpError);
        expect(err.message).to.equal("Code already exists");
      }
    });

    it("throws if name already exists", async () => {
      sinon.stub(bookGenreRepository, "findByCode").resolves(null);
      sinon.stub(bookGenreRepository, "findByName").resolves({ id: "1" });

      try {
        await bookGenreService.createBookGenre({
          code: "FIC",
          name: "Fiction",
          description: "desc",
        });
        throw new Error("Expected error");
      } catch (err) {
        expect(err).to.be.instanceOf(HttpError);
        expect(err.message).to.equal("Name already exists");
      }
    });

    it("creates book genre successfully", async () => {
      const createStub = sinon
        .stub(bookGenreRepository, "create")
        .resolves({
          id: "1",
          code: "FIC",
          name: "Fiction",
          description: "desc",
        });
      sinon.stub(bookGenreRepository, "findByCode").resolves(null);
      sinon.stub(bookGenreRepository, "findByName").resolves(null);

      const result = await bookGenreService.createBookGenre({
        code: "FIC",
        name: "Fiction",
        description: "desc",
      });

      expect(createStub.calledOnce).to.be.true;
      expect(result.name).to.equal("Fiction");
    });
  });

  describe("getBookGenreById()", () => {
    it("throws if not found", async () => {
      sinon.stub(bookGenreRepository, "findById").resolves(null);

      try {
        await bookGenreService.getBookGenreById("1");
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Book genre not found");
      }
    });

    it("returns book genre", async () => {
      sinon
        .stub(bookGenreRepository, "findById")
        .resolves({ id: "1", name: "Fiction" });

      const result = await bookGenreService.getBookGenreById("1");
      expect(result.name).to.equal("Fiction");
    });
  });

  describe("getBookGenreByCode()", () => {
    it("throws if not found", async () => {
      sinon.stub(bookGenreRepository, "findByCode").resolves(null);

      try {
        await bookGenreService.getBookGenreByCode("FIC");
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Book genre not found");
      }
    });

    it("returns book genre", async () => {
      sinon
        .stub(bookGenreRepository, "findByCode")
        .resolves({ id: "1", code: "FIC" });

      const result = await bookGenreService.getBookGenreByCode("FIC");
      expect(result.code).to.equal("FIC");
    });
  });

  describe("getBookGenreByName()", () => {
    it("throws if not found", async () => {
      sinon.stub(bookGenreRepository, "findByName").resolves(null);

      try {
        await bookGenreService.getBookGenreByName("Fiction");
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Book genre not found");
      }
    });

    it("returns book genre", async () => {
      sinon
        .stub(bookGenreRepository, "findByName")
        .resolves({ id: "1", name: "Fiction" });

      const result = await bookGenreService.getBookGenreByName("Fiction");
      expect(result.name).to.equal("Fiction");
    });
  });

  describe("findBookGenresByIds()", () => {
    it("returns multiple genres", async () => {
      sinon.stub(bookGenreRepository, "findByIds").resolves([
        { id: "1", name: "Fiction" },
        { id: "2", name: "Sci-Fi" },
      ]);

      const result = await bookGenreService.findBookGenresByIds(["1", "2"]);
      expect(result).to.be.an("array").with.length(2);
    });
  });

  describe("getBookGenres()", () => {
    it("returns all genres", async () => {
      sinon
        .stub(bookGenreRepository, "findAll")
        .resolves([{ id: "1", name: "Fiction" }]);

      const result = await bookGenreService.getBookGenres();
      expect(result).to.be.an("array").with.length(1);
    });
  });

  describe("updateBookGenre()", () => {
    it("throws if not found", async () => {
      sinon.stub(bookGenreRepository, "findById").resolves(null);

      try {
        await bookGenreService.updateBookGenre("1", { name: "New Name" });
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Book genre not found");
      }
    });

    it("throws if new code already exists", async () => {
      const genreObj = {
        id: "1",
        code: "OLD",
        name: "Fiction",
        update: async function (updates) {
          Object.assign(this, updates);
          return this;
        },
      };
      sinon.stub(bookGenreRepository, "findById").resolves(genreObj);
      sinon.stub(bookGenreRepository, "findByCode").resolves({ id: "2" });
      sinon.stub(bookGenreRepository, "findByName").resolves(null);

      try {
        await bookGenreService.updateBookGenre("1", { code: "NEW" });
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Code already exists");
      }
    });

    it("throws if new name already exists", async () => {
      const genreObj = {
        id: "1",
        code: "OLD",
        name: "Fiction",
        update: async function (updates) {
          Object.assign(this, updates);
          return this;
        },
      };
      sinon.stub(bookGenreRepository, "findById").resolves(genreObj);
      sinon.stub(bookGenreRepository, "findByCode").resolves(null);
      sinon.stub(bookGenreRepository, "findByName").resolves({ id: "2" });

      try {
        await bookGenreService.updateBookGenre("1", { name: "New Name" });
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Name already exists");
      }
    });

    it("updates successfully", async () => {
      const genreObj = {
        id: "1",
        code: "OLD",
        name: "Fiction",
        update: async function (updates) {
          Object.assign(this, updates);
          return this;
        },
      };
      sinon.stub(bookGenreRepository, "findById").resolves(genreObj);
      sinon.stub(bookGenreRepository, "findByCode").resolves(null);
      sinon.stub(bookGenreRepository, "findByName").resolves(null);

      const result = await bookGenreService.updateBookGenre("1", {
        name: "New Name",
        code: "NEW",
      });

      expect(result.name).to.equal("New Name");
      expect(result.code).to.equal("NEW");
    });
  });

  describe("deleteBookGenreById()", () => {
    it("throws if not found", async () => {
      sinon.stub(bookGenreRepository, "findById").resolves(null);

      try {
        await bookGenreService.deleteBookGenreById("1");
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Book genre not found");
      }
    });

    it("throws if associated books exist", async () => {
      sinon.stub(bookGenreRepository, "findById").resolves({ id: "1" });
      sinon.stub(bookService, "countBooksByBookGenreId").resolves(2);

      try {
        await bookGenreService.deleteBookGenreById("1");
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal(
          "This book genre cannot be deleted because it has associated books"
        );
      }
    });

    it("deletes successfully", async () => {
      sinon.stub(bookGenreRepository, "findById").resolves({ id: "1" });
      sinon.stub(bookService, "countBooksByBookGenreId").resolves(0);
      const deleteStub = sinon
        .stub(bookGenreRepository, "deleteById")
        .resolves();

      await bookGenreService.deleteBookGenreById("1");

      expect(deleteStub.calledOnceWith("1")).to.be.true;
    });
  });
});
