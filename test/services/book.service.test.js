import { expect } from "chai";
import sinon from "sinon";
import bookService from "../../src/services/book.service.js";
import bookRepository from "../../src/repositories/book.repository.js";
import bookTypeService from "../../src/services/book-type.service.js";
import bookGenreService from "../../src/services/book-genre.service.js";
import s3Utils from "../../src/utils/s3-wrapper.util.js";

describe("BookService", () => {
  afterEach(() => sinon.restore());

  describe("createBook()", () => {
    it("throws if no PDF file provided", async () => {
      try {
        await bookService.createBook("u1", { title: "Book 1" });
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal("PDF file is required");
      }
    });

    it("throws if book fingerprint already exists and is active", async () => {
      sinon
        .stub(bookRepository, "findByFingerprint")
        .resolves({ isActive: true });
      try {
        await bookService.createBook("u1", {
          title: "Book 1",
          authors: ["A"],
          edition: "1",
          languageCode: "en",
          pdfFile: { buffer: Buffer.from("") },
        });
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Book already exists");
      }
    });

    it("creates a book successfully", async () => {
      const pdfFile = { buffer: Buffer.from(""), mimetype: "application/pdf" };
      sinon.stub(bookRepository, "findByFingerprint").resolves(null);
      sinon.stub(bookTypeService, "getBookTypeById").resolves({ id: "type1" });
      sinon
        .stub(bookGenreService, "findBookGenresByIds")
        .resolves([{ id: "genre1" }]);
      sinon.stub(s3Utils, "uploadFileToS3").resolves("s3://file.pdf");

      const fakeBook = {
        id: "b1",
        setBookGenres: sinon.stub(),
        toJSON: function () {
          return { ...this };
        },
      };
      sinon.stub(bookRepository, "create").resolves(fakeBook);

      const result = await bookService.createBook("u1", {
        title: "Book 1",
        authors: ["A"],
        edition: "1",
        languageCode: "en",
        bookTypeId: "type1",
        bookGenreIds: ["genre1"],
        pdfFile,
      });

      expect(result.id).to.equal("b1");
      expect(fakeBook.setBookGenres.calledOnce).to.be.true;
      expect(result.bookType.id).to.equal("type1");
    });
  });

  describe("updateBook()", () => {
    it("throws if book not found", async () => {
      sinon.stub(bookRepository, "findById").resolves(null);
      try {
        await bookService.updateBook("b1", { title: "New" });
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Book not found");
      }
    });

    it("updates allowed fields successfully", async () => {
      const saveStub = sinon.stub().resolvesThis();

      const fakeBook = {
        id: "b1",
        title: "Old Title",
        authors: ["Author1"],
        edition: "1st",
        description: "Old description",
        languageCode: "en",
        releaseDate: new Date("2020-01-01"),
        pageCount: 100,
        bookTypeId: "type1",
        save: saveStub,
        getBookType: sinon.stub().resolves({ id: "type2", name: "New Type" }),
        getBookGenres: sinon
          .stub()
          .resolves([{ id: "genre1", name: "Genre1" }]),
        setBookGenres: sinon.stub().resolves(),
      };

      sinon.stub(bookRepository, "findById").resolves(fakeBook);
      sinon.stub(bookRepository, "findByFingerprint").resolves(null); // ✅ ADD THIS
      sinon
        .stub(bookTypeService, "getBookTypeById")
        .resolves({ id: "type2", name: "New Type" });
      sinon
        .stub(bookGenreService, "findBookGenresByIds")
        .resolves([{ id: "genre1", name: "Genre1" }]);

      const updates = {
        title: "New Title",
        authors: ["Author1", "Author2"],
        edition: "2nd",
        description: "Updated description",
        languageCode: "fr",
        pageCount: 120,
        bookTypeId: "type2",
        bookGenreIds: ["genre1"],
      };

      const result = await bookService.updateBook("b1", updates);

      expect(saveStub.calledOnce).to.be.true;
      expect(result.title).to.equal("New Title");
      expect(result.authors).to.deep.equal(["Author1", "Author2"]);
      expect(result.edition).to.equal("2nd");
      expect(result.description).to.equal("Updated description");
      expect(result.languageCode).to.equal("fr");
      expect(result.pageCount).to.equal(120);
      expect(result.bookType.id).to.equal("type2");
      expect(result.getBookGenres.calledOnce).to.be.true;
      expect(fakeBook.setBookGenres.calledOnceWith(["genre1"])).to.be.true;
    });
  });

  describe("activateBook()", () => {
    it("activates a book", async () => {
      const fakeBook = {
        id: "b1",
        isActive: false,
        save: sinon.stub().resolvesThis(),
      };
      sinon.stub(bookRepository, "findById").resolves(fakeBook);

      const result = await bookService.activateBook("admin1", "b1");
      expect(result.isActive).to.be.true;
      expect(result.save.calledOnce).to.be.true;
    });
  });

  describe("deleteBookById()", () => {
    it("throws if book not found", async () => {
      sinon.stub(bookRepository, "findById").resolves(null);
      try {
        await bookService.deleteBookById("b1");
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Book not found");
      }
    });

    it("deletes book and calls S3 & request updates", async () => {
      const fakeBook = {
        id: "b1",
        s3PdfUrl: "s3://file.pdf",
        fingerprint: "fp",
        setBookGenres: sinon.stub().resolves(),
        getBookRequest: sinon
          .stub()
          .resolves({ update: sinon.stub().resolves() }),
      };
      sinon.stub(bookRepository, "findById").resolves(fakeBook);
      sinon.stub(s3Utils, "deleteFileFromS3").resolves();
      sinon.stub(bookRepository, "deleteById").resolves();

      await bookService.deleteBookById("b1");

      expect(s3Utils.deleteFileFromS3.calledOnceWith("fp.pdf")).to.be.true;
      expect(fakeBook.setBookGenres.calledOnce).to.be.true;
    });
  });

  describe("_buildBookFingerprint()", () => {
    it("creates a consistent fingerprint", () => {
      const book = {
        title: "T",
        authors: ["A"],
        edition: "1",
        languageCode: "en",
      };
      const fingerprint = bookService._buildBookFingerprint(book);
      expect(fingerprint).to.be.a("string").with.length(64);
    });
  });
});
