/**
 * Database tasks
 *
 * @copyright Copyright (c) 2017, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import { argv } from 'yargs'
import app from '../app'

const { mongo } = app

if (argv.seed) mongo.seed({ disconnect: true })
else if (argv.reset) mongo.reset({ disconnect: true })
