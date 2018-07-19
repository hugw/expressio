export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, unique: true },
  })

  User.associate = (models) => {
    models.User.hasMany(models.Task)
  }

  return User
}
