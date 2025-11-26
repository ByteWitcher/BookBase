import userRepository from "../repositories/user.repository.js";

class UserService {
  getUserById(id) {
    return userRepository.findById(id);
  }

  getUserByEmail(email) {
    return userRepository.findByEmail(email);
  }

  getUserByUsername(username) {
    return userRepository.findByUsername(username);
  }

  getUsers() {
    return userRepository.findAll();
  }

  async updateUser(id, req, data) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error("User not found");
    }

    if (data.email && data.email !== user.email) {
      const existingEmail = await userRepository.findByEmail(data.email);
      if (existingEmail) {
        throw new Error("Email already in use");
      }
      user.email = data.email;
    }

    if (data.username && data.username !== user.username) {
      const existingUsername = await userRepository.findByUsername(
        data.username,
      );
      if (existingUsername) {
        throw new Error("Username already in use");
      }
      user.username = data.username;
    }

    if (data.role && req && req.role === "ADMIN") {
      user.role = data.role;
    }

    return await user.save();
  }

  async deleteUser(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    await userRepository.delete(id);
  }
}

export default new UserService();
