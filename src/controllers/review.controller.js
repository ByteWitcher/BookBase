import reviewService from '../services/review.service.js';
import Book from '../entities/book.entity.js';


class ReviewController {
  async createReview(req, res) {
    try {
      const userId = req.user.id;
      const { id: bookId } = req.params;
      const { rating, comment } = req.body;

      if (rating === undefined || rating === null) {
        return res.status(400).json({
          success: false,
          error: 'Rating is required'
        });
      }

      const review = await reviewService.createReview(userId, bookId, rating, comment);
      
      res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: review
      });
    } catch (error) {
      let statusCode = 500;
      if (error.message.includes('not found')) statusCode = 404;
      else if (error.message.includes('cannot')) statusCode = 403;
      else if (error.message.includes('already')) statusCode = 409;
      else if (error.message.includes('Rating must be')) statusCode = 400;
      
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateReview(req, res) {
    try {
      const userId = req.user.id;
      const { reviewId } = req.params;
      const { rating, comment } = req.body;

      const updateData = {};
      if (rating !== undefined) updateData.rating = rating;
      if (comment !== undefined) updateData.comment = comment;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No data to update'
        });
      }

      const review = await reviewService.updateReview(reviewId, userId, updateData);
      
      res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: review
      });
    } catch (error) {
      let statusCode = 500;
      if (error.message.includes('not found')) statusCode = 404;
      else if (error.message.includes('not authorized')) statusCode = 403;
      else if (error.message.includes('Rating must be')) statusCode = 400;
      
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteReview(req, res) {
    try {
      const userId = req.user.id;
      const isAdmin = req.user.role === 'ADMIN';
      const { reviewId } = req.params;

      const result = await reviewService.deleteReview(reviewId, userId, isAdmin);
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: { reviewId }
      });
    } catch (error) {
      let statusCode = 500;
      if (error.message.includes('not found')) statusCode = 404;
      else if (error.message.includes('not authorized')) statusCode = 403;
      
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }
  async getBookReviews(req, res) {
    try {
      const { id: bookId } = req.params;
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;

      const result = await reviewService.getBookReviews(bookId, { limit, offset });

      const book = await Book.findByPk(bookId);
      if (!book) throw new Error('Book not found');
      const averageRating = book.averageRating || 0;

      res.status(200).json({
        success: true,
        averageRating,
        data: result.reviews,
        pagination: {
          page: result.page,
          limit,
          offset,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      let statusCode = 500;
      if (error.message.includes('not found')) statusCode = 404;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async getMyReviews(req, res) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;

      const result = await reviewService.getUserReviews(userId, { limit, offset });
      
      res.status(200).json({
        success: true,
        data: result.reviews,
        pagination: {
          page: result.page,
          limit,
          offset,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new ReviewController();