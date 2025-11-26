import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const BookGenre = sequelize.define(
  "BookGenre",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { timestamps: true, updatedAt: false }
);

BookGenre.associate = (models) => {
  BookGenre.belongsToMany(models.Book, {
    through: "BooksGenres",
    foreignKey: "bookGenreId",
    as: "books",
  });
};

export default BookGenre;
