import { DataTypes, Model } from 'sequelize';

export default function initUser(sequelize) {
  class User extends Model {}

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'Users',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: false,
    }
  );

  User.associate = (models) => {
    const useFk = process.env.USE_DB_FKS === 'true';
    User.hasMany(models.ReadingSession, { foreignKey: 'userId', constraints: useFk });
    User.hasMany(models.ReadingAchievement, { foreignKey: 'userId', constraints: useFk });
    User.hasMany(models.WeeklyReadingSummary, { foreignKey: 'userId', constraints: useFk });
  };

  return User;
}
