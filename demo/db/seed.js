/**
 * Seed data
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

export default async function (models) {
  await models.User.create({ name: 'John Doe', email: 'jd@gmail.com', hidden: 'hide me' })
}
