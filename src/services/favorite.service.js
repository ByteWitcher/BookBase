import favoriteRepository from '../repositories/favorite.repository.js';
import Book from '../entities/book.entity.js';

class FavoriteService {

  // Ajouter un livre aux favoris
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

  // Retirer un livre des favoris
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

  // Récupérer les favoris de l'utilisateur
  async getUserFavorites(userId, pagination = {}) {
    const result = await favoriteRepository.getUserFavorites(userId, pagination);

    return {
      favorites: result.rows.map(fav => fav.book),
      total: result.count,
      page: Math.floor((pagination.offset || 0) / (pagination.limit || 10)) + 1,
      totalPages: Math.ceil(result.count / (pagination.limit || 10))
    };
  }

  // Vérifier si un livre est favori
  async isFavorited(userId, bookId) {
    return await favoriteRepository.isFavorited(userId, bookId);
  }
}

export default new FavoriteService();
