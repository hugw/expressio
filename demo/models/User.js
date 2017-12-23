export default (sequelize, dataTypes) => (
  sequelize.define('User', {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: dataTypes.INTEGER
    },
    name: {
      type: dataTypes.STRING,
      notEmpty: true
    },
    email: {
      type: dataTypes.STRING,
      validate: {
        isEmail: true
      }
    },
  })
)
