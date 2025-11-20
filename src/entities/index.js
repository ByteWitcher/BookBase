import sequelize from "../config/database.js";
import Book from "./Book.js";
import BookType from "./BookType.js";
import BookGenre from "./BookGenre.js";

const models = {
  Book,
  BookType,
  BookGenre,
};

Object.values(models)
  .filter((model) => typeof model.associate === "function")
  .forEach((model) => model.associate(models));

export { sequelize };
export default models;
