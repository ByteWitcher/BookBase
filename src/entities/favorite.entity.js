import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Favorite = sequelize.define('Favorite', {
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  bookId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Books',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'favorites',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'bookId']
    }
  ]
});

// Déclaration des associations
Favorite.associate = (models) => {
  Favorite.belongsTo(models.User, { 
    foreignKey: 'userId', 
    as: 'user' 
  });
  
  Favorite.belongsTo(models.Book, { 
    foreignKey: 'bookId', 
    as: 'book' 
  });
};

export default Favorite;