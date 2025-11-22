import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Book = sequelize.define(
  "Book",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    // hash of title+authors+edition+language
    fingerprint: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    authors: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    languageCode: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { is: /^[a-z]{2}$/ },
    },
    edition: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pageCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    releaseDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    s3PdfUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    rating: {
      type: DataTypes.FLOAT.UNSIGNED,
      allowNull: false,
      defaultValue: 0.0,
    },
    likes: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
  },
  { timestamps: true, updatedAt: false }
);

Book.associate = (models) => {
  Book.belongsTo(models.BookType, { foreignKey: "bookTypeId", as: "bookType" });
  Book.belongsToMany(models.BookGenre, {
    through: "BookGenres",
    foreignKey: "bookId",
    as: "bookGenres",
  });
  Book.belongsTo(models.User, { foreignKey: "uploaderId", as: "uploader" });
  Book.belongsTo(models.User, { foreignKey: "approverId", as: "approver" });
};

export default Book;
