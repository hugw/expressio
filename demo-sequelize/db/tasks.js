/**
 * Database tasks
 *
 * @copyright Copyright (c) 2018, hugw.io
 * @author Hugo W - me@hugw.io
 * @license MIT
 */

import { argv } from 'yargs'
import app from '../app'

const { sequelize } = app

if (argv.up) sequelize.migrations.run('up')
if (argv.down) sequelize.migrations.run('down')
if (argv.prev) sequelize.migrations.run('prev')
if (argv.next) sequelize.migrations.run('next')
if (argv.seed) sequelize.seed()
if (argv.reset) sequelize.reset()
if (argv.truncate) sequelize.truncate()
