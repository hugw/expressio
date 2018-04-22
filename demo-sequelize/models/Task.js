export default (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    title: DataTypes.STRING
  })

  Task.associate = (models) => {
    models.Task.belongsTo(models.User, {
      onDelete: 'CASCADE',
    })
  }

  return Task
}
