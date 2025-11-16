import userRepo from "../repositories/user.repository.js";

class UserService {
    getUserById(id) {
        return userRepo.findById(id);
    }

    getUserByEmail(email) {
        return userRepo.findByEmail(email);
    }

    getUserByUsername(username) {
        return userRepo.findByUsername(username);
    }

    getUsers() {
        return userRepo.findAll();
    }

    async updateUser(id, data) {
        const user = await userRepo.findById(id);
        if (!user) {
            throw new Error("User not found");
        }

        if (data.email && data.email !== user.email) {
            const existingEmail = await userRepo.findByEmail(data.email);
            if (existingEmail) {
                throw new Error("Email already in use");
            }
            user.email = data.email;
        }

        if (data.username && data.username !== user.username) {
            const existingUsername = await userRepo.findByUsername(data.username);
            if (existingUsername) {
                throw new Error("Username already in use");
            }
            user.username = data.username;
        }

        return await user.save();
    }
}

export default new UserService();
