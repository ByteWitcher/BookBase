import reviewRepository from '../repositories/review.repository.js';
import Book from '../entities/book.entity.js';

class ReviewService {

  // Créer une review
  async createReview(userId, bookId, rating, comment) {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const book = await Book.findByPk(bookId);
    if (!book) throw new Error('Book not found');
    if (!book.visibility) throw new Error('Book is not available');
    if (book.addedById === userId) {
      throw new Error('You cannot review your own book');
    }

    const review = await reviewRepository.createReview({
      userId,
      bookId,
      rating,
      comment
    });

    await this.recalculateBookRating(bookId);

    return review;
  }

  // Mettre à jour une review
  async updateReview(reviewId, userId, data) {
    const review = await reviewRepository.getReviewById(reviewId);
    if (!review) throw new Error('Review not found');
    if (review.userId !== userId) {
      throw new Error('You are not authorized to update this review');
    }

    if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    const updated = await reviewRepository.updateReview(reviewId, data);

    await this.recalculateBookRating(review.bookId);

    return updated;
  }

  // Supprimer une review
  async deleteReview(reviewId, userId, isAdmin = false) {
    const review = await reviewRepository.getReviewById(reviewId);
    if (!review) throw new Error('Review not found');

    if (!isAdmin && review.userId !== userId) {
      throw new Error('You are not authorized to delete this review');
    }

    await reviewRepository.deleteReview(reviewId);
    await this.recalculateBookRating(review.bookId);

    return {
      message: 'Review deleted successfully',
      reviewId
    };
  }

  // Reviews d’un livre
  async getBookReviews(bookId, pagination = {}) {
    const book = await Book.findByPk(bookId);
    if (!book) throw new Error('Book not found');

    const result = await reviewRepository.getBookReviews(bookId, pagination);

    return {
      reviews: result.rows,
      total: result.count,
      page: Math.floor((pagination.offset || 0) / (pagination.limit || 10)) + 1,
      totalPages: Math.ceil(result.count / (pagination.limit || 10))
    };
  }

  // Review d'un user pour un livre
  async getUserReview(userId, bookId) {
    return await reviewRepository.getUserReview(userId, bookId);
  }

  // Recalcul du rating
  async recalculateBookRating(bookId) {
    const { averageRating, totalReviews } =
      await reviewRepository.calculateAverageRating(bookId);

    await Book.update(
      { averageRating },
      { where: { id: bookId } }
    );

    return { averageRating, totalReviews };
  }

  // Reviews d’un utilisateur
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
