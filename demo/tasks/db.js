/**
 * Database tasks
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import { argv } from 'yargs'
import app from '../app'

if (argv.reset) app.resetDB()
if (argv.seed) app.seedDB()
