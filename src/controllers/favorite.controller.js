// controllers/favorite.controller.js
import favoriteService from '../services/favorite.service.js';

class FavoriteController {
  async addToFavorites(req, res) {
    try {
      const userId = req.user.id;
      const { id: bookId } = req.params;

      const result = await favoriteService.addToFavorites(userId, bookId);
      
      res.status(201).json({
        success: true,
        message: result.message,
        data: { bookId: result.bookId }
      });
    } catch (error) {
      res.status(error.message.includes('not found') ? 404 : 400).json({
        success: false,
        error: error.message
      });
    }
  }

  async removeFromFavorites(req, res) {
    try {
      const userId = req.user.id;
      const { id: bookId } = req.params;

      const result = await favoriteService.removeFromFavorites(userId, bookId);
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: { bookId: result.bookId }
      });
    } catch (error) {
      res.status(error.message.includes('not found') ? 404 : 400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getMyFavorites(req, res) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;

      const result = await favoriteService.getUserFavorites(userId, { limit, offset });
      
      res.status(200).json({
        success: true,
        data: result.favorites,
        pagination: { limit, offset, total: result.total }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new FavoriteController();