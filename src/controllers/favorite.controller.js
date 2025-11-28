import favoriteService from "../services/favorite.service.js";

class FavoriteController {
  async addToFavorites(req, res) {
    try {
      const userId = req.user.id;
      const { id: bookId } = req.params;

      const result = await favoriteService.addToFavorites(userId, bookId);

      res.status(201).json({
        success: true,
        message: result.message,
        data: { bookId: result.bookId },
      });
    } catch (error) {
      let statusCode = 500;
      if (error.message.includes("not found")) statusCode = 404;
      else if (error.message.includes("already")) statusCode = 409;
      else if (error.message.includes("not available")) statusCode = 400;

      res.status(statusCode).json({
        success: false,
        error: error.message,
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
        data: { bookId: result.bookId },
      });
    } catch (error) {
      let statusCode = 500;
      if (error.message.includes("not found")) statusCode = 404;

      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getMyFavorites(req, res) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;

      const result = await favoriteService.getUserFavorites(userId, {
        limit,
        offset,
      });

      res.status(200).json({
        success: true,
        data: result.favorites,
        pagination: {
          page: result.page,
          limit,
          offset,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export default new FavoriteController();
