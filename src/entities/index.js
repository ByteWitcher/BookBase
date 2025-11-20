import sequelize from '../config/database.js';
import initUser from './user.entity.js';
import initBook from './book.entity.js';
import initReadingSession from './readingSession.entity.js';
import initReadingAchievement from './readingAchievement.entity.js';
import initWeeklyReadingSummary from './weeklyReadingSummary.entity.js';

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
