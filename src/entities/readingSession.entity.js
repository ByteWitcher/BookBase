import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ReadingSession = sequelize.define('ReadingSession', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  userId: { type: DataTypes.UUID, allowNull: false },
  bookId: { type: DataTypes.UUID, allowNull: false },
  startTime: { type: DataTypes.DATE, allowNull: false },
  endTime: { type: DataTypes.DATE, allowNull: false },
  startPage: { type: DataTypes.INTEGER, allowNull: false },
  endPage: { type: DataTypes.INTEGER, allowNull: false },
  pagesRead: {
    type: DataTypes.VIRTUAL,
    get() {
      const sp = this.get('startPage');
      const ep = this.get('endPage');
      if (sp == null || ep == null) return null;
      return Math.max(0, ep - sp);
    },
  },
}, {
  sequelize,
  modelName: 'ReadingSession',
  tableName: 'ReadingSessions',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false,
});

ReadingSession.associate = (models) => {
  const useFk = process.env.USE_DB_FKS === 'true';
  ReadingSession.belongsTo(models.User, { foreignKey: 'userId', constraints: useFk });
  ReadingSession.belongsTo(models.Book, { foreignKey: 'bookId', constraints: useFk });
};

export default ReadingSession;
