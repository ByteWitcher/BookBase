import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Book = sequelize.define('Book', {
  id: { 
    type: DataTypes.UUID, 
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  title: DataTypes.STRING,
  // ... autres champs
});

// AJOUTER cette partie
Book.associate = (models) => {
  // Reviews
  Book.hasMany(models.Review, { 
    foreignKey: 'bookId', 
    as: 'reviews' 
  });
  
  // Favorites (Many-to-Many)
  Book.belongsToMany(models.User, {
    through: models.Favorite,
    as: 'favoritedByUsers',
    foreignKey: 'bookId',
    otherKey: 'userId'
  });
  
  // Likes (Many-to-Many)
  Book.belongsToMany(models.User, {
    through: models.Like,
    as: 'likedByUsers',
    foreignKey: 'bookId',
    otherKey: 'userId'
  });
};

export default Book;