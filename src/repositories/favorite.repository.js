import Book from '../entities/book.entity.js';
import User from '../entities/user.entity.js';



class FavoriteRepository {

  async addFavorite(userId, bookId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found');

      const book = await Book.findByPk(bookId);
      if (!book) throw new Error('Book not found');

      await user.addFavoriteBook(book);
      return { userId, bookId };
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Book already in favorites');
      }
      throw error;
    }
  }


  async removeFavorite(userId, bookId) {
    const user = await User.findByPk(userId);
    if (!user) return 0;

    const book = await Book.findByPk(bookId);
    if (!book) return 0;

   
    const removed = await user.removeFavoriteBook(book);
    return removed > 0 ? 1 : 0;
  }

  
  async getUserFavorites(userId, { limit = 10, offset = 0 } = {}) {
    const user = await User.findByPk(userId);
    if (!user) return { rows: [], count: 0 };

    const books = await user.getFavoriteBooks({
      limit,
      offset,
    });

    const count = await user.countFavoriteBooks();
    const rows = books.map(book => ({ book }));
    return {
      rows,
      count
    };
  }

  async isFavorited(userId, bookId) {
    const user = await User.findByPk(userId);
    if (!user) return false;

    const book = await Book.findByPk(bookId);
    if (!book) return false;
    return await user.hasFavoriteBook(book);
  }

  async countBookFavorites(bookId) {
    const book = await Book.findByPk(bookId);
    if (!book) return 0;

    return await book.countFavoritedByUsers();
  }
}

export default new FavoriteRepository();
