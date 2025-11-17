import Favorite from '../entities/favorite.entity.js';
import Book from '../entities/book.entity.js';
import User from '../entities/user.entity.js';

class FavoriteRepository {
   //Ajouter un livre aux favoris
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
    const deleted = await Favorite.destroy({
      where: { userId, bookId }
    });
    return deleted;
  }


   // Récupérer les livres favoris d'un utilisateur

  async getUserFavorites(userId, { limit = 10, offset = 0 } = {}) {
    return await Favorite.findAll({
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
      order: [['createdAt', 'DESC']] // Si vous ajoutez un createdAt plus tard
    });
  }


   // Vérifier si un livre est dans les favoris

  async isFavorited(userId, bookId) {
    const favorite = await Favorite.findOne({
      where: { userId, bookId }
    });
    return !!favorite;
  }


   // Compter le nombre de favoris d'un livre
  
  async countBookFavorites(bookId) {
    return await Favorite.count({
      where: { bookId }
    });
  }
}

export default new FavoriteRepository();