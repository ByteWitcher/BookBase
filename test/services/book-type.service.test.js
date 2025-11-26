import { expect } from "chai";
import sinon from "sinon";
import bookTypeService from "../../src/services/book-type.service.js";
import bookTypeRepository from "../../src/repositories/book-type.repository.js";
import bookService from "../../src/services/book.service.js";
import HttpError from "../../src/utils/http-error.util.js";

describe("BookTypeService", () => {
  afterEach(() => sinon.restore());

  describe("createBookType()", () => {
    it("throws if code already exists", async () => {
      sinon.stub(bookTypeRepository, "findByCode").resolves({ id: "1" });
      sinon.stub(bookTypeRepository, "findByName").resolves(null);

      try {
        await bookTypeService.createBookType({
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
      sinon.stub(bookTypeRepository, "findByCode").resolves(null);
      sinon.stub(bookTypeRepository, "findByName").resolves({ id: "1" });

      try {
        await bookTypeService.createBookType({
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

    it("creates book type successfully", async () => {
      const createStub = sinon.stub(bookTypeRepository, "create").resolves({
        id: "1",
        code: "FIC",
        name: "Fiction",
        description: "desc",
      });
      sinon.stub(bookTypeRepository, "findByCode").resolves(null);
      sinon.stub(bookTypeRepository, "findByName").resolves(null);

      const result = await bookTypeService.createBookType({
        code: "FIC",
        name: "Fiction",
        description: "desc",
      });

      expect(createStub.calledOnce).to.be.true;
      expect(result.name).to.equal("Fiction");
    });
  });

  describe("getBookTypeById()", () => {
    it("throws if not found", async () => {
      sinon.stub(bookTypeRepository, "findById").resolves(null);

      try {
        await bookTypeService.getBookTypeById("1");
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Book type not found");
      }
    });

    it("returns book type", async () => {
      sinon
        .stub(bookTypeRepository, "findById")
        .resolves({ id: "1", name: "Fiction" });

      const result = await bookTypeService.getBookTypeById("1");
      expect(result.name).to.equal("Fiction");
    });
  });

  describe("getBookTypeByCode()", () => {
    it("throws if not found", async () => {
      sinon.stub(bookTypeRepository, "findByCode").resolves(null);

      try {
        await bookTypeService.getBookTypeByCode("FIC");
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Book type not found");
      }
    });

    it("returns book type", async () => {
      sinon
        .stub(bookTypeRepository, "findByCode")
        .resolves({ id: "1", code: "FIC" });

      const result = await bookTypeService.getBookTypeByCode("FIC");
      expect(result.code).to.equal("FIC");
    });
  });

  describe("getBookTypeByName()", () => {
    it("throws if not found", async () => {
      sinon.stub(bookTypeRepository, "findByName").resolves(null);

      try {
        await bookTypeService.getBookTypeByName("Fiction");
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Book type not found");
      }
    });

    it("returns book type", async () => {
      sinon
        .stub(bookTypeRepository, "findByName")
        .resolves({ id: "1", name: "Fiction" });

      const result = await bookTypeService.getBookTypeByName("Fiction");
      expect(result.name).to.equal("Fiction");
    });
  });

  describe("getBookTypes()", () => {
    it("returns all book types", async () => {
      sinon
        .stub(bookTypeRepository, "findAll")
        .resolves([{ id: "1", name: "Fiction" }]);

      const result = await bookTypeService.getBookTypes();
      expect(result).to.be.an("array").with.length(1);
    });
  });

  describe("updateBookType()", () => {
    it("throws if book type not found", async () => {
      sinon.stub(bookTypeRepository, "findById").resolves(null);

      try {
        await bookTypeService.updateBookType("1", { name: "New Name" });
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Book type not found");
      }
    });

    it("throws if new code already exists", async () => {
      sinon.stub(bookTypeRepository, "findById").resolves({
        id: "1",
        code: "OLD",
        name: "Fiction",
        update: sinon.stub().resolves(),
      });
      sinon.stub(bookTypeRepository, "findByCode").resolves({ id: "2" });

      try {
        await bookTypeService.updateBookType("1", { code: "NEW" });
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Code already exists");
      }
    });

    it("throws if new name already exists", async () => {
      sinon.stub(bookTypeRepository, "findById").resolves({
        id: "1",
        code: "OLD",
        name: "Fiction",
        update: sinon.stub().resolves(),
      });
      sinon.stub(bookTypeRepository, "findByCode").resolves(null);
      sinon.stub(bookTypeRepository, "findByName").resolves({ id: "2" });

      try {
        await bookTypeService.updateBookType("1", { name: "New Name" });
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Name already exists");
      }
    });

    it("updates successfully", async () => {
      const bookTypeObj = {
        id: "1",
        code: "OLD",
        name: "Fiction",
        update: async function (updates) {
          Object.assign(this, updates);
          return this;
        },
      };

      sinon.stub(bookTypeRepository, "findById").resolves(bookTypeObj);
      sinon.stub(bookTypeRepository, "findByCode").resolves(null);
      sinon.stub(bookTypeRepository, "findByName").resolves(null);

      const result = await bookTypeService.updateBookType("1", {
        name: "New Name",
        code: "NEW",
      });

      expect(result.name).to.equal("New Name");
      expect(result.code).to.equal("NEW");
    });
  });

  describe("deleteBookTypeById()", () => {
    it("throws if book type not found", async () => {
      sinon.stub(bookTypeRepository, "findById").resolves(null);

      try {
        await bookTypeService.deleteBookTypeById("1");
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal("Book type not found");
      }
    });

    it("throws if associated books exist", async () => {
      sinon.stub(bookTypeRepository, "findById").resolves({ id: "1" });
      sinon.stub(bookService, "countBooksByBookTypeId").resolves(2);

      try {
        await bookTypeService.deleteBookTypeById("1");
        throw new Error("Expected error");
      } catch (err) {
        expect(err.message).to.equal(
          "This book type cannot be deleted because it has associated books"
        );
      }
    });

    it("deletes successfully", async () => {
      sinon.stub(bookTypeRepository, "findById").resolves({ id: "1" });
      sinon.stub(bookService, "countBooksByBookTypeId").resolves(0);
      const deleteStub = sinon
        .stub(bookTypeRepository, "deleteById")
        .resolves();

      await bookTypeService.deleteBookTypeById("1");

      expect(deleteStub.calledOnceWith("1")).to.be.true;
    });
  });
});
