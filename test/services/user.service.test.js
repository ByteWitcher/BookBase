import { expect } from "chai";
import sinon from "sinon";
import userService from "../../src/services/user.service.js";
import userRepository from "../../src/repositories/user.repository.js";

describe("UserService.updateUser()", () => {

  afterEach(() => sinon.restore());

  it("throws if user not found", async () => {
    sinon.stub(userRepository, "findById").resolves(null);

    try {
      await userService.updateUser(1, {}, {});
      throw new Error("Expected error");
    } catch (err) {
      expect(err.message).to.equal("User not found");
    }
  });

  it("throws if email already exists", async () => {
    sinon.stub(userRepository, "findById").resolves({
      id: 1,
      email: "old@mail.com",
      username: "oldUser",
      role: "USER",
      save: sinon.stub().resolves()
    });

    sinon.stub(userRepository, "findByEmail").resolves({ id: 2 });
    sinon.stub(userRepository, "findByUsername").resolves(null);

    try {
      await userService.updateUser(
        1,
        { role: "USER" },
        { email: "duplicate@mail.com" }
      );
      throw new Error("Expected error");
    } catch (err) {
      expect(err.message).to.equal("Email already in use");
    }
  });

  it("throws if username already exists", async () => {
    sinon.stub(userRepository, "findById").resolves({
      id: 1,
      email: "test@mail.com",
      username: "oldUser",
      role: "USER",
      save: sinon.stub().resolves()
    });
    
    sinon.stub(userRepository, "findByEmail").resolves(null);
    sinon.stub(userRepository, "findByUsername").resolves({ id: 2 });

    try {
      await userService.updateUser(
        1,
        { role: "USER" },
        { username: "duplicateUser" }
      );
      throw new Error("Expected error");
    } catch (err) {
      expect(err.message).to.equal("Username already in use");
    }
  });

  it("updates email successfully", async () => {
    const savedUser = sinon.stub().resolvesThis();
    
    sinon.stub(userRepository, "findById").resolves({
      id: 1,
      email: "test@mail.com",
      username: "oldUser",
      role: "USER",
      save: savedUser,
    });

    sinon.stub(userRepository, "findByEmail").resolves(null);
    sinon.stub(userRepository, "findByUsername").resolves(null);

    const result = await userService.updateUser(
      1,
      { role: "USER" },
      { email: "new@mail.com" }
    );

    expect(savedUser.calledOnce).to.be.true;
    expect(result.email).to.equal("new@mail.com");
  });

  it("updates username successfully", async () => {
    const savedUser = sinon.stub().resolvesThis();

    sinon.stub(userRepository, "findById").resolves({
      id: 1,
      email: "test@mail.com",
      username: "oldUser",
      role: "USER",
      save: savedUser,
    });

    sinon.stub(userRepository, "findByEmail").resolves(null);
    sinon.stub(userRepository, "findByUsername").resolves(null);

    const result = await userService.updateUser(
      1,
      { role: "USER" },
      { username: "newUser" }
    );

    expect(savedUser.calledOnce).to.be.true;
    expect(result.username).to.equal("newUser");
  });

  it("updates role successfully by admin", async () => {
    const savedUser = sinon.stub().resolvesThis();

    sinon.stub(userRepository, "findById").resolves({
      id: 1,
      email: "test@mail.com",
      username: "oldUser",
      role: "USER",
      save: savedUser,
    });

    sinon.stub(userRepository, "findByEmail").resolves(null);
    sinon.stub(userRepository, "findByUsername").resolves(null);

    const result = await userService.updateUser(
      1,
      { role: "ADMIN" },
      { role: "ADMIN" }
    );

    expect(savedUser.calledOnce).to.be.true;
    expect(result.role).to.equal("ADMIN");
  });

  it("does not update role if not admin", async () => {
    const savedUser = sinon.stub().resolvesThis();

    sinon.stub(userRepository, "findById").resolves({
      id: 1,
      email: "test@mail.com",
      username: "oldUser",
      role: "USER",
      save: savedUser,
    });

    sinon.stub(userRepository, "findByEmail").resolves(null);
    sinon.stub(userRepository, "findByUsername").resolves(null);

    const result = await userService.updateUser(
      1,
      { role: "USER" },
      { role: "ADMIN" }
    );

    expect(savedUser.calledOnce).to.be.true;
    expect(result.role).to.equal("USER");
  });

  it("updates multiple fields successfully", async () => {
    const savedUser = sinon.stub().resolvesThis();

    sinon.stub(userRepository, "findById").resolves({
      id: 1,
      email: "test@mail.com",
      username: "oldUser",
      role: "USER",
      save: savedUser,
    });

    sinon.stub(userRepository, "findByEmail").resolves(null);
    sinon.stub(userRepository, "findByUsername").resolves(null);

    const result = await userService.updateUser(
      1,
      { role: "ADMIN" },
      { email: "new@mail.com", username: "newUser", role: "ADMIN" }
    );

    expect(savedUser.calledOnce).to.be.true;
    expect(result.email).to.equal("new@mail.com");
    expect(result.username).to.equal("newUser");
    expect(result.role).to.equal("ADMIN");
  });

  it("returns unchanged user if no data provided", async () => {
    const savedUser = sinon.stub().resolvesThis();

    sinon.stub(userRepository, "findById").resolves({
      id: 1,
      email: "test@mail.com",
      username: "testUser",
      role: "USER",
      save: savedUser,
    });

    const result = await userService.updateUser(1, { role: "USER" }, {});

    expect(savedUser.calledOnce).to.be.true;
    expect(result.email).to.equal("test@mail.com");
    expect(result.username).to.equal("testUser");
    expect(result.role).to.equal("USER");
  });

  it("deletes user successfully", async () => {
    sinon.stub(userRepository, "findById").resolves({
      id: 1,
      email: "test@mail.com",
      username: "testUser",
      role: "USER",
    });
    
    const deleteStub = sinon.stub(userRepository, "delete").resolves();
    await userService.deleteUser(1);
    
    expect(deleteStub.calledOnceWith(1)).to.be.true;
  });
  
});
