import sequelize from '../config/database.js';
import initUser from './User.js';
import initBook from './Book.js';
import initReadingSession from './ReadingSession.js';
import initReadingAchievement from './ReadingAchievement.js';
import initWeeklyReadingSummary from './WeeklyReadingSummary.js';

const models = {};

models.User = initUser(sequelize);
models.Book = initBook(sequelize);
models.ReadingSession = initReadingSession(sequelize);
models.ReadingAchievement = initReadingAchievement(sequelize);
models.WeeklyReadingSummary = initWeeklyReadingSummary(sequelize);

// Call associate on models that define it (associations are declared inside each model file)
Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') model.associate(models);
});

export { sequelize };
export default models;
