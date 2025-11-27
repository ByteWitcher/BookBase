import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM("USER", "ADMIN"),
      defaultValue: "USER",
    },
  },
  {
    timestamps: true,
    updatedAt: false,
  },
);

User.associate = (models) => {
  User.hasMany(models.BookRequest, {
    foreignKey: "userId",
    as: "bookRequests",
  });
  User.hasMany(models.BookRequest, {
    foreignKey: "adminId",
    as: "processedBookRequests",
  });
  User.hasMany(models.Book, {
    foreignKey: "userId",
    as: "books",
  });
  User.hasMany(models.Book, {
    foreignKey: "adminId",
    as: "processedBooks",
  });
   User.belongsToMany(models.Book, {
    through: 'Favorites',
    foreignKey: 'userId',
    otherKey: 'bookId',
    as: 'favoriteBooks',
    timestamps: true
  });

  // Likes
  User.belongsToMany(models.Book, {
    through: 'Likes',
    foreignKey: 'userId',
    otherKey: 'bookId',
    as: 'likedBooks',
    timestamps: true
  });

  // Reviews
  User.hasMany(models.Review, {
    foreignKey: 'userId',
    as: 'reviews'
  });

};

export default User;
