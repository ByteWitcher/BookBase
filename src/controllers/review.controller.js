// controllers/review.controller.js
import reviewService from '../services/review.service.js';

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
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('cannot') ? 403 : 
                        error.message.includes('already') ? 409 : 400;
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
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('not authorized') ? 403 : 400;
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
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('not authorized') ? 403 : 400;
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
      
      res.status(200).json({
        success: true,
        data: result.reviews,
        pagination: {
          page: result.page,
          limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      res.status(error.message.includes('not found') ? 404 : 500).json({
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