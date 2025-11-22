import favoriteRepository from '../repositories/favorite.repository.js';
import Book from '../entities/book.entity.js';

class FavoriteService {

  async addToFavorites(userId, bookId) {
    const book = await Book.findByPk(bookId);
    if (!book) throw new Error('Book not found');
    if (!book.visibility) throw new Error('Book is not available');

    await favoriteRepository.addFavorite(userId, bookId);

    return {
      message: 'Book added to favorites',
      bookId
    };
  }

  async removeFromFavorites(userId, bookId) {
    const deleted = await favoriteRepository.removeFavorite(userId, bookId);

    if (deleted === 0) {
      throw new Error('Favorite not found');
    }

    return {
      message: 'Book removed from favorites',
      bookId
    };
  }

  async getUserFavorites(userId, pagination = {}) {
    const result = await favoriteRepository.getUserFavorites(userId, pagination);
    
    const limit = pagination.limit || 10;
    const offset = pagination.offset || 0;
    
    return {
      favorites: result.rows.map(fav => fav.book), 
      total: result.count,                           
      page: Math.floor(offset / limit) + 1,         
      totalPages: result.count > 0 ? Math.ceil(result.count / limit) : 0  // ✅ Corrigé
    };
  }

  async isFavorited(userId, bookId) {
    return await favoriteRepository.isFavorited(userId, bookId);
  }
}

export default new FavoriteService();