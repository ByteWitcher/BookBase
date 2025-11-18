import bcrypt from "bcryptjs";
import userRepository from "../repositories/user.repository.js";
import JwtUtil from "../utils/jwt.js";

class AuthService {
    async register(data) {
        const existingEmail = await userRepository.findByEmail(data.email);
        if (existingEmail) throw new Error("Email already exists");

        const existingUsername = await userRepository.findByUsername(data.username);
        if (existingUsername) throw new Error("Username already exists");

        const hashed = await bcrypt.hash(data.password, 10);

        const user = await userRepository.create({
            username: data.username,
            email: data.email,
            password: hashed,
            role: "USER"
        });

        return user;
    }

    async login(email, password) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error("Wrong email!");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw new Error("Wrong password!");
        }

        const token = JwtUtil.sign({ id: user.id, email: user.email, role: user.role });

        const { password: _, ...safeUser } = user.toJSON ? user.toJSON() : user;

        return { user: safeUser, token };
    }

    async resetPassword(email, oldPassword, newPassword) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error("User not found");
        }

        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) {
            throw new Error("Old password is incorrect");
        }

        const hashed = await bcrypt.hash(newPassword, 10);

        user.password = hashed;
        await user.save();

        return { message: "Password updated successfully" };
    }
}

export default new AuthService();
