// repositories/like.repository.js
import Like from '../entities/like.entity.js';
import User from '../entities/user.entity.js';
import Book from '../entities/book.entity.js';

class LikeRepository {

   // Ajouter un like

  async addLike(userId, bookId) {
    try {
      return await Like.create({ userId, bookId });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Book already liked');
      }
      throw error;
    }
  }


   // Retirer un like

  async removeLike(userId, bookId) {
    const deleted = await Like.destroy({
      where: { userId, bookId }
    });
    return deleted;
  }

  
   // Récupérer les utilisateurs qui ont liké un livre

  async getBookLikes(bookId) {
    return await Like.findAll({
      where: { bookId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        }
      ]
    });
  }

  
   // Compter le nombre de likes d'un livre
   
  async countBookLikes(bookId) {
    return await Like.count({
      where: { bookId }
    });
  }

  
   // Vérifier si un utilisateur a liké un livre
  
  async isLiked(userId, bookId) {
    const like = await Like.findOne({
      where: { userId, bookId }
    });
    return !!like;
  }
}

export default new LikeRepository();