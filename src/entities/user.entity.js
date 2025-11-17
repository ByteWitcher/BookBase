import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: { 
    type: DataTypes.UUID, 
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  username: DataTypes.STRING,
  // ... autres champs
});

// AJOUTER cette partie
User.associate = (models) => {
  // Reviews
  User.hasMany(models.Review, { 
    foreignKey: 'userId', 
    as: 'reviews' 
  });
  
  // Favorites (Many-to-Many)
  User.belongsToMany(models.Book, {
    through: models.Favorite,
    as: 'favoriteBooks',
    foreignKey: 'userId',
    otherKey: 'bookId'
  });
  
  // Likes (Many-to-Many)
  User.belongsToMany(models.Book, {
    through: models.Like,
    as: 'likedBooks',
    foreignKey: 'userId',
    otherKey: 'bookId'
  });
};

export default User;