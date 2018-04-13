export default async function (models) {
  await models.User.create({ name: 'John Doe', hiddenField: 'hide me' })
}
