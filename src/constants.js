/**
 * Constants
 *
 * @copyright Copyright (c) 2018, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

export const FOLDERS = {
  public: 'public',
  config: 'config'
}

export const LOGGER = {
  response: ['statusCode', 'body'],
  request: [
    'url',
    'headers',
    'method',
    'httpVersion',
    'originalUrl',
    'query',
    'body'
  ]
}
