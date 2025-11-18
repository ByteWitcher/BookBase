import { expect } from "chai";
import sinon from "sinon";
import authService from "../../src/services/auth.service.js";
import userRepository from "../../src/repositories/user.repository.js";
import bcrypt from "bcryptjs";
import JwtUtil from "../../src/utils/jwt.js";

describe("login()", () => {

    afterEach(() => sinon.restore());

    it("throws if email not found", async () => {
        sinon.stub(userRepository, "findByEmail").resolves(null);

        try {
            await authService.login("nonexistent@mail.com", "password");
            throw new Error("Expected error");
        } catch (err) {
            expect(err.message).to.equal("Wrong email!");
        }
    });

    it("should throw if password is wrong", async () => {
        sinon.stub(userRepository, "findByEmail").resolves({
            id: 1,
            email: "test@mail.com",
            password: "hashed123"
        });

        sinon.stub(bcrypt, "compare").resolves(false);

        try {
            await authService.login("test@mail.com", "wrongpass");
            throw new Error("Expected error");
        } catch (err) {
            expect(err.message).to.equal("Wrong password!");
        }
    });

    it("should update password successfully", async () => {
        const fakeUser = {
            id: 1,
            password: "oldHash",
            save: sinon.stub().resolvesThis()
        };

        sinon.stub(userRepository, "findByEmail").resolves(fakeUser);
        sinon.stub(bcrypt, "compare").resolves(true);
        sinon.stub(bcrypt, "hash").resolves("newHash");

        const result = await authService.resetPassword("mail@mail.com", "oldPass", "newPass");

        expect(fakeUser.save.calledOnce).to.be.true;
        expect(fakeUser.password).to.equal("newHash");
        expect(result.message).to.equal("Password updated successfully");
    });

});