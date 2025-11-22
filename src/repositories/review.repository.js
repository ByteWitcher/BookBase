// repositories/review.repository.js
import Review from '../entities/review.entity.js';
import User from '../entities/user.entity.js';
import Book from '../entities/book.entity.js';
import sequelize from '../config/database.js';

class ReviewRepository {
  
  // Créer une review
  async createReview(data) {
    try {
      return await Review.create(data);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Review already exists for this book');
      }
      throw error;
    }
  }

  // Mettre à jour une review
  async updateReview(reviewId, data) {
    const [updated] = await Review.update(data, {
      where: { id: reviewId }
    });
    
    if (updated === 0) {
      throw new Error('Review not found');
    }
    
    return await this.getReviewById(reviewId);
  }

  // Supprimer une review
  async deleteReview(reviewId) {
    const deleted = await Review.destroy({
      where: { id: reviewId }
    });
    return deleted > 0;  // ✅ Retourne boolean
  }

  // Récupérer les reviews d'un livre
  async getBookReviews(bookId, { limit = 10, offset = 0 } = {}) {
    return await Review.findAndCountAll({
      where: { bookId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
  }

  // Récupérer la review d'un utilisateur pour un livre
  async getUserReview(userId, bookId) {
    return await Review.findOne({
      where: { userId, bookId }
    });
  }

  // Récupérer une review par son ID
  async getReviewById(reviewId) {
    return await Review.findByPk(reviewId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        },
        {
          model: Book,
          as: 'book',
          attributes: ['id', 'title']
        }
      ]
    });
  }

  // Calculer la moyenne des ratings d'un livre
  async calculateAverageRating(bookId) {
    const result = await Review.findOne({
      where: { bookId },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews']
      ],
      raw: true
    });
    
    return {
      // ✅ Arrondi à 1 décimale
      averageRating: Math.round((parseFloat(result?.avgRating) || 0) * 10) / 10,
      totalReviews: parseInt(result?.totalReviews) || 0
    };
  }

  // Récupérer toutes les reviews d'un utilisateur
  async getUserReviews(userId, { limit = 10, offset = 0 } = {}) {
    return await Review.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Book,
          as: 'book',
          attributes: ['id', 'title', 'authors', 's3PdfUrl']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
  }
}

export default new ReviewRepository();