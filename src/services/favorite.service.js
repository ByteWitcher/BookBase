import favoriteRepository from '../repositories/favorite.repository.js';
import Book from '../entities/book.entity.js';

class FavoriteService {

  async addToFavorites(userId, bookId) {
    const book = await Book.findByPk(bookId);
    if (!book) throw new Error('Book not found');
    if (!book.isActive) throw new Error('Book is not available');

    await favoriteRepository.addFavorite(userId, bookId);

    return {
      success: true,
      message: 'Book added to favorites',
      bookId
    };
  }

  async removeFromFavorites(userId, bookId) {
    const removed = await favoriteRepository.removeFavorite(userId, bookId);

    if (removed === 0) throw new Error('Favorite not found');

    return {
      success: true,
      message: 'Book removed from favorites',
      bookId
    };
  }

  async getUserFavorites(userId, pagination = {}) {
    const result = await favoriteRepository.getUserFavorites(userId, pagination);

    const limit = pagination.limit || 10;
    const offset = pagination.offset || 0;

    return {
      favorites: result.rows.map(f => f.book),
      total: result.count,
      page: Math.floor(offset / limit) + 1,
      totalPages: result.count ? Math.ceil(result.count / limit) : 0
    };
  }

  async isFavorited(userId, bookId) {
    return await favoriteRepository.isFavorited(userId, bookId);
  }
}

export default new FavoriteService();
