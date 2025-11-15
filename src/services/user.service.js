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
}

export default new UserService();
