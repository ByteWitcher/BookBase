import { DataTypes, Model } from 'sequelize';

export default function initBook(sequelize) {
  class Book extends Model {}

  Book.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      // Add pageNumbers for validation in reading session creation
      pageNumbers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100, // stub default
        validate: { min: 1 }
      },
    },
    {
      sequelize,
      modelName: 'Book',
      tableName: 'Books',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: false,
    }
  );

  Book.associate = (models) => {
    const useFk = process.env.USE_DB_FKS === 'true';
    Book.hasMany(models.ReadingSession, { foreignKey: 'bookId', constraints: useFk });
  };

  return Book;
}
