import Favorite from '../entities/favorite.entity.js';
import Book from '../entities/book.entity.js';

class FavoriteRepository {

  // Ajouter un livre aux favoris
  async addFavorite(userId, bookId) {
    try {
      return await Favorite.create({ userId, bookId });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Book already in favorites');
      }
      throw error;
    }
  }

  // Retirer un livre des favoris
  async removeFavorite(userId, bookId) {
    return await Favorite.destroy({
      where: { userId, bookId }
    });
  }

  // Récupérer les favoris (avec pagination correcte)
  async getUserFavorites(userId, { limit = 10, offset = 0 } = {}) {
    return await Favorite.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Book,
          as: 'book',
          attributes: ['id', 'title', 'authors', 's3PdfUrl', 'averageRating', 'totalLikes']
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
  }

  // Vérifier si favori
  async isFavorited(userId, bookId) {
    return !!(await Favorite.findOne({ where: { userId, bookId } }));
  }

  // Compter les favoris d'un livre
  async countBookFavorites(bookId) {
    return await Favorite.count({ where: { bookId } });
  }
}

export default new FavoriteRepository();
