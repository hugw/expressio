/**
 * Database tasks
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import { argv } from 'yargs'
import app from '../app'

const { database } = app

if (argv.seed) database.seed({ disconnect: true })
else if (argv.reset) database.reset({ disconnect: true })
