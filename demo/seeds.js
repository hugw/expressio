/**
 * Seed data
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

export default function (models, promises) {
  promises.push(models.User.create({ name: 'John Doe', email: 'jd@gmail.com' }))
  return promises
}
