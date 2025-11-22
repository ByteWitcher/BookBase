import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  rating: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true, 
  },
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
  tableName: 'reviews',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'bookId']
    }
  ]
});

Review.associate = (models) => {
  Review.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  Review.belongsTo(models.Book, { foreignKey: 'bookId', as: 'book' });
};

export default Review;