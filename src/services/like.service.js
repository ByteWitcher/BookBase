import likeRepository from '../repositories/like.repository.js';
import Book from '../entities/book.entity.js';

class LikeService {
  // Toggle like (ajouter ou retirer)

  async toggleLike(userId, bookId) {
    // Vérifier si le livre existe
    const book = await Book.findByPk(bookId);
    if (!book) {
      throw new Error('Book not found');
    }

    // Vérifier si le livre est visible
    if (!book.visibility) {
      throw new Error('Book is not available');
    }

    // Vérifier la règle business: un user ne peut pas liker son propre livre
    if (book.addedById === userId) {
      throw new Error('You cannot like your own book');
    }

    // Vérifier si déjà liké
    const isLiked = await likeRepository.isLiked(userId, bookId);
    
    if (isLiked) {
      // Retirer le like
      await likeRepository.removeLike(userId, bookId);
    } else {
      // Ajouter le like
      await likeRepository.addLike(userId, bookId);
    }

    // Mettre à jour le compteur totalLikes du livre
    const totalLikes = await likeRepository.countBookLikes(bookId);
    await book.update({ totalLikes });

    return { 
      liked: !isLiked, 
      totalLikes,
      bookId 
    };
  }


   // Récupérer les utilisateurs qui ont liké un livre
   
  async getBookLikes(bookId) {
    // Vérifier si le livre existe
    const book = await Book.findByPk(bookId);
    if (!book) {
      throw new Error('Book not found');
    }

    const likes = await likeRepository.getBookLikes(bookId);
    
    return {
      users: likes.map(like => like.user),
      total: likes.length
    };
  }

  
   // Vérifier si un utilisateur a liké un livre
  async isLiked(userId, bookId) {
    return await likeRepository.isLiked(userId, bookId);
  }
}

export default new LikeService();