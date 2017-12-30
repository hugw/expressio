/**
 * Validate.js setup
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import validatejs from 'validate.js'

// Setup default options
validatejs.async.options = { fullMessages: false, format: 'detailed' }
validatejs.validators.equality.message = 'does not match'
validatejs.Promise = global.Promise

export default validatejs
