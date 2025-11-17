import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Like = sequelize.define('Like', {
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
  tableName: 'likes',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'bookId']
    }
  ]
});

// Déclaration des associations
Like.associate = (models) => {
  Like.belongsTo(models.User, { 
    foreignKey: 'userId', 
    as: 'user' 
  });
  
  Like.belongsTo(models.Book, { 
    foreignKey: 'bookId', 
    as: 'book' 
  });
};

export default Like;