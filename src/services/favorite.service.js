import favoriteRepository from '../repositories/favorite.repository.js';
import Book from '../entities/book.entity.js';

class FavoriteService {
    
   //Ajouter un livre aux favoris
  async addToFavorites(userId, bookId) {
    // Vérifier si le livre existe
    const book = await Book.findByPk(bookId);
    if (!book) {
      throw new Error('Book not found');
    }

    // Vérifier si le livre est visible
    if (!book.visibility) {
      throw new Error('Book is not available');
    }

    // Ajouter aux favoris
    await favoriteRepository.addFavorite(userId, bookId);
    
    return { 
      message: 'Book added to favorites',
      bookId 
    };
  }

  
   // Retirer un livre des favoris
   
  async removeFromFavorites(userId, bookId) {
    const deleted = await favoriteRepository.removeFavorite(userId, bookId);
    
    if (deleted === 0) {
      throw new Error('Favorite not found');
    }
    
    return { 
      message: 'Book removed from favorites',
      bookId 
    };
  }


   // Récupérer les livres favoris d'un utilisateur
  async getUserFavorites(userId, pagination = {}) {
    const favorites = await favoriteRepository.getUserFavorites(userId, pagination);
    
    return {
      favorites: favorites.map(fav => fav.book),
      total: favorites.length
    };
  }

  
   //Vérifier si un livre est dans les favoris
 
  async isFavorited(userId, bookId) {
    return await favoriteRepository.isFavorited(userId, bookId);
  }
}

export default new FavoriteService();