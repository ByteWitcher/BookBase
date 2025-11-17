import reviewRepository from '../repositories/review.repository.js';
import Book from '../entities/book.entity.js';

class ReviewService {
  
   // Créer une review
   
  async createReview(userId, bookId, rating, comment) {
    // Validation du rating
    if (rating < 0 || rating > 5) {
      throw new Error('Rating must be between 0 and 5');
    }

    // Vérifier si le livre existe
    const book = await Book.findByPk(bookId);
    if (!book) {
      throw new Error('Book not found');
    }

    // Vérifier si le livre est visible
    if (!book.visibility) {
      throw new Error('Book is not available');
    }

    // Règle business: un user ne peut pas reviewer son propre livre
    if (book.addedById === userId) {
      throw new Error('You cannot review your own book');
    }

    // Créer la review
    const review = await reviewRepository.createReview({
      userId,
      bookId,
      rating,
      comment
    });

    // Recalculer la moyenne du livre
    await this.recalculateBookRating(bookId);

    return review;
  }


   // Mettre à jour une review
   
  async updateReview(reviewId, userId, data) {
    // Récupérer la review
    const review = await reviewRepository.getReviewById(reviewId);
    
    if (!review) {
      throw new Error('Review not found');
    }

    // Vérifier que l'utilisateur est bien l'auteur
    if (review.userId !== userId) {
      throw new Error('You are not authorized to update this review');
    }

    // Validation du rating si fourni
    if (data.rating !== undefined && (data.rating < 0 || data.rating > 5)) {
      throw new Error('Rating must be between 0 and 5');
    }

    // Mettre à jour
    const updated = await reviewRepository.updateReview(reviewId, data);

    // Recalculer la moyenne
    await this.recalculateBookRating(review.bookId);

    return updated;
  }

  // Supprimer une review

  async deleteReview(reviewId, userId, isAdmin = false) {
    // Récupérer la review
    const review = await reviewRepository.getReviewById(reviewId);
    
    if (!review) {
      throw new Error('Review not found');
    }

    // Vérifier les permissions
    // Un admin peut supprimer n'importe quelle review
    // Un user ne peut supprimer que sa propre review
    if (!isAdmin && review.userId !== userId) {
      throw new Error('You are not authorized to delete this review');
    }

    // Supprimer la review
    await reviewRepository.deleteReview(reviewId);

    // Recalculer la moyenne
    await this.recalculateBookRating(review.bookId);

    return { 
      message: 'Review deleted successfully',
      reviewId 
    };
  }


   // Récupérer les reviews d'un livre
   
  async getBookReviews(bookId, pagination = {}) {
    // Vérifier si le livre existe
    const book = await Book.findByPk(bookId);
    if (!book) {
      throw new Error('Book not found');
    }

    const result = await reviewRepository.getBookReviews(bookId, pagination);
    
    return {
      reviews: result.rows,
      total: result.count,
      page: Math.floor((pagination.offset || 0) / (pagination.limit || 10)) + 1,
      totalPages: Math.ceil(result.count / (pagination.limit || 10))
    };
  }

   // Récupérer la review d'un utilisateur pour un livre

  async getUserReview(userId, bookId) {
    return await reviewRepository.getUserReview(userId, bookId);
  }

  

  // Recalculer la moyenne des ratings d'un livre
  //  CRITIQUE : Cette méthode est appelée après chaque CREATE/UPDATE/DELETE de review
  
  async recalculateBookRating(bookId) {
    const { averageRating, totalReviews } = await reviewRepository.calculateAverageRating(bookId);
    
    // Mettre à jour le livre
    await Book.update(
      { averageRating },
      { where: { id: bookId } }
    );

    return { averageRating, totalReviews };
  }

 
   // Récupérer toutes les reviews d'un utilisateur
   
  async getUserReviews(userId, pagination = {}) {
    const result = await reviewRepository.getUserReviews(userId, pagination);
    
    return {
      reviews: result.rows,
      total: result.count,
      page: Math.floor((pagination.offset || 0) / (pagination.limit || 10)) + 1,
      totalPages: Math.ceil(result.count / (pagination.limit || 10))
    };
  }
}

export default new ReviewService();