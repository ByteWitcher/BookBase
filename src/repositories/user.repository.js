import User from "../entities/user.entity.js";

class UserRepository {
    async create(data) {
        return await User.create(data);
    }

    findById(id) {
        return User.findByPk(id);
    }

    findByEmail(email) {
        return User.findOne({ where: { email } });
    }

    findByUsername(username) {
        return User.findOne({ where: { username } });
    }

    findAll() {
        return User.findAll({ attributes: { exclude: ['password'] } });
    }
}

export default new UserRepository();
