import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Book = sequelize.define('Book', {
  id: { 
    type: DataTypes.UUID, 
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  languageCode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  authors: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false
  },
  pageNumbers: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  releaseDate: {
    type: DataTypes.DATE
  },
  s3PdfUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  averageRating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  totalLikes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
  type: DataTypes.BOOLEAN,
  allowNull: false,
  defaultValue: false,
  },
  addedById: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  timestamps: true,
});

Book.associate = (models) => {
  // Favorites
  Book.belongsToMany(models.User, {
    through: 'Favorites',
    foreignKey: 'bookId',
    otherKey: 'userId',
    as: 'favoritedByUsers',
    timestamps: true
  });

  // Likes
  Book.belongsToMany(models.User, {
    through: 'Likes',
    foreignKey: 'bookId',
    otherKey: 'userId',
    as: 'likedByUsers',
    timestamps: true
  });

  // Reviews
  Book.hasMany(models.Review, {
    foreignKey: 'bookId',
    as: 'reviews'
  });
};

export default Book;