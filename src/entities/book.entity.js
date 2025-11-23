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
    // hash of title+authors+edition+languageCode
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
    edition: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    languageCode: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { is: /^[a-z]{2}$/ },
    },
    releaseDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    pageCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    likes: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.FLOAT.UNSIGNED,
      allowNull: false,
      defaultValue: 0.0,
    },
    s3PdfUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
  Book.belongsTo(models.User, { foreignKey: "userId", as: "user" });
  Book.belongsTo(models.User, { foreignKey: "adminId", as: "admin" });
  Book.hasOne(models.BookRequest, { foreignKey: "bookId", as: "bookRequest" });
};

export default Book;
