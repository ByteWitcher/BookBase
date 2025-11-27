import User from "../entities/user.entity.js";
import Book from "../entities/book.entity.js";

class LikeRepository {
  async addLike(userId, bookId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) throw new Error("User not found");

      const book = await Book.findByPk(bookId);
      if (!book) throw new Error("Book not found");

      await user.addLikedBook(book);

      return { userId, bookId };
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new Error("Book already liked");
      }
      throw error;
    }
  }

  async removeLike(userId, bookId) {
    const user = await User.findByPk(userId);
    if (!user) return 0;

    const book = await Book.findByPk(bookId);
    if (!book) return 0;

    const removed = await user.removeLikedBook(book);
    return removed > 0 ? 1 : 0;
  }

  async getBookLikes(bookId) {
    const book = await Book.findByPk(bookId);
    if (!book) return [];

    const users = await book.getLikedByUsers({
      attributes: ["id", "username"],
      joinTableAttributes: [],
    });

    return users.map((user) => ({ user }));
  }

  async countBookLikes(bookId) {
    const book = await Book.findByPk(bookId);
    if (!book) return 0;

    return await book.countLikedByUsers();
  }

  async isLiked(userId, bookId) {
    const user = await User.findByPk(userId);
    if (!user) return false;

    const book = await Book.findByPk(bookId);
    if (!book) return false;

    return await user.hasLikedBook(book);
  }
}

export default new LikeRepository();
