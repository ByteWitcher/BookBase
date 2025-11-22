import likeService from '../services/like.service.js';

class LikeController {
  /**
   * POST /books/:id/like
   * Toggle le like (ajoute si pas liké, retire si déjà liké)
   */
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
          action: result.liked ? 'LIKED' : 'UNLIKED',  // ✅ Ajouté pour le front
          totalLikes: result.totalLikes
        }
      });
    } catch (error) {
      let statusCode = 500;
      if (error.message.includes('not found')) statusCode = 404;
      else if (error.message.includes('cannot')) statusCode = 403;
      else if (error.message.includes('not available')) statusCode = 400;
      
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  // ✅ SUPPRIMÉ : unlikeBook() - était redondant avec likeBook() qui fait déjà toggle

  /**
   * GET /books/:id/likes
   * Récupérer les utilisateurs qui ont liké un livre
   */
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
      let statusCode = 500;
      if (error.message.includes('not found')) statusCode = 404;
      
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new LikeController();