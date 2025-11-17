// controllers/like.controller.js
import likeService from '../services/like.service.js';

class LikeController {
  async likeBook(req, res) {
    try {
      const userId = req.user.id;
      const { id: bookId } = req.params;

      const result = await likeService.toggleLike(userId, bookId);
      
      res.status(200).json({
        success: true,
        message: result.liked ? 'Book liked' : 'Book unliked',
        data: {
          bookId: result.bookId,
          liked: result.liked,
          totalLikes: result.totalLikes
        }
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('cannot') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async unlikeBook(req, res) {
    try {
      const userId = req.user.id;
      const { id: bookId } = req.params;

      const result = await likeService.toggleLike(userId, bookId);
      
      res.status(200).json({
        success: true,
        message: result.liked ? 'Book liked' : 'Book unliked',
        data: {
          bookId: result.bookId,
          liked: result.liked,
          totalLikes: result.totalLikes
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getBookLikes(req, res) {
    try {
      const { id: bookId } = req.params;

      const result = await likeService.getBookLikes(bookId);
      
      res.status(200).json({
        success: true,
        data: {
          users: result.users,
          total: result.total
        }
      });
    } catch (error) {
      res.status(error.message.includes('not found') ? 404 : 500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new LikeController();