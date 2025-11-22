import sequelize from "../config/database.js";
import { readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Make VSCode understand the structure of db
 * This gives Sequelize method IntelliSense without defining fields.
 *
 * @type {Record<string, import("sequelize").ModelCtor<import("sequelize").Model>>}
 */

const db = {};

// import all models
const files = readdirSync(__dirname).filter(
  (file) => file !== "index.js" && file.endsWith(".js")
);

for (const file of files) {
  const model = (await import(join(__dirname, file))).default;
  db[model.name] = model;
}

// apply associations
Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

db.sequelize = sequelize;

export default db;
