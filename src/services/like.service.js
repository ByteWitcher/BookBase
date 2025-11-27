import likeRepository from '../repositories/like.repository.js';
import Book from '../entities/book.entity.js';

class LikeService {

  async toggleLike(userId, bookId) {
    const book = await Book.findByPk(bookId);
    if (!book) throw new Error('Book not found');
    if (!book.isActive) throw new Error('Book is not available');

    if (book.addedById === userId) {
      throw new Error('You cannot like your own book');
    }

    const isLiked = await likeRepository.isLiked(userId, bookId);

    if (isLiked) {
      await likeRepository.removeLike(userId, bookId);
    } else {
      await likeRepository.addLike(userId, bookId);
    }

    const totalLikes = await likeRepository.countBookLikes(bookId);

    await book.update({ totalLikes });

    return {
      success: true,
      liked: !isLiked,
      totalLikes,
      bookId
    };
  }

  async getBookLikes(bookId) {
    const book = await Book.findByPk(bookId);
    if (!book) throw new Error('Book not found');

    const likes = await likeRepository.getBookLikes(bookId);

    return {
      users: likes.map(l => l.user),
      total: likes.length
    };
  }

  async isLiked(userId, bookId) {
    return await likeRepository.isLiked(userId, bookId);
  }
}

export default new LikeService();
