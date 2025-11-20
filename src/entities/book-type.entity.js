import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const BookType = sequelize.define(
  "BookType",
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
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  { timestamps: true, updatedAt: false }
);

BookType.associate = (models) => {
  BookType.hasMany(models.Book, { foreignKey: "bookTypeId", as: "books" });
};

export default BookType;
