export default async function (models) {
  const user = await models.User.create({ name: 'foo', email: 'foo@foo.com' })
  const task1 = await models.Task.create({ title: 'Do something' })
  const task2 = await models.Task.create({ title: 'Do something else' })
  await user.setTasks([task1, task2])
}
