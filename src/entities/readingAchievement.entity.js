import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ReadingAchievement = sequelize.define('ReadingAchievement', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  userId: { type: DataTypes.UUID, allowNull: false },
  code: {
    type: DataTypes.ENUM(
      'FIRST_SESSION',
      'STREAK_3',
      'STREAK_5',
      'STREAK_7',
      'STREAK_14',
      'FIFTY_PAGES_ONE_DAY',
      'TEN_BOOKS_FINISHED',
      'CONSISTENT_READER'
    ),
    allowNull: false,
  },
  label: { type: DataTypes.STRING, allowNull: false },
  unlockedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  sequelize,
  modelName: 'ReadingAchievement',
  tableName: 'ReadingAchievements',
  timestamps: false,
});

ReadingAchievement.associate = (models) => {
  const useFk = process.env.USE_DB_FKS === 'true';
  ReadingAchievement.belongsTo(models.User, { foreignKey: 'userId', constraints: useFk });
};

export default ReadingAchievement;
