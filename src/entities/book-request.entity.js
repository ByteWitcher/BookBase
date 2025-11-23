import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const BookRequest = sequelize.define(
  "BookRequest",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // below attribute are only used if we delete the corresponding book
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    authors: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    edition: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    languageCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { timestamps: true, updatedAt: false }
);

BookRequest.associate = (models) => {
  BookRequest.belongsTo(models.Book, {
    foreignKey: "bookId",
    as: "book",
  });
};

export default BookRequest;
