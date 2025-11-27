import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const WeeklyReadingSummary = sequelize.define('WeeklyReadingSummary', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  userId: { type: DataTypes.UUID, allowNull: false },
  weekStart: { type: DataTypes.DATEONLY, allowNull: false },
  weekEnd: { type: DataTypes.DATEONLY, allowNull: false },
  totalReadingMinutes: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalPagesRead: { type: DataTypes.INTEGER, defaultValue: 0 },
  averageSpeed: { type: DataTypes.FLOAT, defaultValue: 0 },
}, {
  sequelize,
  modelName: 'WeeklyReadingSummary',
  tableName: 'WeeklyReadingSummaries',
  timestamps: false,
});

WeeklyReadingSummary.associate = (models) => {
  const useFk = process.env.USE_DB_FKS === 'true';
  WeeklyReadingSummary.belongsTo(models.User, { foreignKey: 'userId', constraints: useFk });
};

export default WeeklyReadingSummary;
