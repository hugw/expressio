# Expressio

[![CircleCI](https://circleci.com/gh/hugw/expressio/tree/master.svg?style=svg&circle-token=db4b0da8980640852612ffcc2c368cf6e7104164)](https://circleci.com/gh/hugw/expressio/tree/master)

Light-weight [Node.js](https://nodejs.org/en/) library to build HTTP APIs using [Express](https://expressjs.com/).

Expressio is a simple catalyst to accelerates the development of modern web applications. With some opinion over configuration in mind, it reduces the initial time a developer has to spend setting up a production-ready service. Additionally, it still preserves the simplicity and flexibility of [Node.js](https://nodejs.org/en/) applications, leaving you in control. 

While extending [Express](https://expressjs.com/), it offers a base structure and environment-aware configurations to support the following features:

    - Security
    - Logging capability
    - Third-party initialization using the server lifecycle events
    - Asynchronous routes
    - Enhanced error handlers
    - Request data validation and sanitization middleware
    - HTTP authentication using JWTs

## Table of Contents

* [Installation](#installation)
* [Usage](#usage)
* [Configuration](#configuration)
* [Validation](#validation)
* [Initializers](#initializers)
* [API](#api)
* [Contributing](#contributing)

## Installation
Expressio works with NodeJS v10 and later.
To install the package in your project using NPM, run the following command:

```
$ npm install expressio
```

If using Yarn:

```
$ yarn add expressio
```

## Usage
Getting your project up and running:

```js
import expressio, { httpError } from 'expressio'

const app = expressio()

app.get('/', (req, res) => {
  res.json({ status: 'online' })
})

app.get('/error', async () => {
  throw httpError(400, { message: 'Something went wrong over here' })
})

app.start()
```

After executing the code, you will notice the following info in the console:

```
[TIMESTAMP][info] Server running → 0.0.0.0:4000 @ development
```

Now you can visit [localhost:4000](http://localhost:4000/).

> Tip: If you inspect `app`  you will realize it is nothing more than an Express app instance with just a few additional functions/objects.

## Configuration

When the Expressio instance is created, it will automatically look for a `config.js` file inside the same folder. The file is optional and will be merged with the default config object provided by the library.

Please check all the available core [config options](src/config.js).

Expressio will compute the environment config variables by doing a deep merge of the **default** attribute and the current environment where your code is running (defaults to **development**).

E.g.

```js
// config.js

export default {
  default: {
    core: {
      port: '4040',

      // Logger
      logger: {
        level: 'debug',
      },
    },

    foo: 'foo-def',
    bar: 'bar-def',
  },

  // Production environment
  production: {
    core: {
      logger: {
        level: 'info',
      },
    },

    foo: 'foo-prod',
  },
}
```

If you `console.log` the config object after initializing your server in a Production environment (`process.env.NODE_ENV === "production"`), you will get the following computed object:

```js

const app = expressio()
console.log(app.config)

// Returns:
// {
//  core: {
//    ...
//    port: '4040',
//    logger: {
//      ...
//      level: 'info',
//    },
//  }
//  foo: 'foo-prod',
//  bar: 'bar-def',
// }
```

> Tip: Avoid creating custom config variables inside the `core` object to not mix with the default library settings.

#### dotenv

By default, Expressio uses the **dotenv** package to load custom environment variables if needed. Simply add a `.env`  file inside the root folder of the project (cwd).

## Validation
The library provides you a middleware for faster request `body`/`params`/`query` validation using [Joi](https://github.com/hapijs/joi).

E.g.

```js
import expressio, { validateRequest } from 'expressio'
import Joi from '@hapi/joi'

const app = expressio()

const name = Joi
  .string()
  .trim()
  .required()
  .label('Name')

const email = Joi
  .string()
  .lowercase()
  .email()
  .required()
  .label('Email')

app.post('/check', validateRequest('body', { name, email }), 

async (req, res) => {
  res.json(req.body)
})
```

If any validation fails, a formatted error object will automatically be returned in your response:

```js
{
  status: 422,
  type: 'VALIDATION',
  message: 'Invalid request body data',
  attributes: {
    email: {
      message: 'Email is required',
      type: 'any.required',
    },
    name: {
      message: 'Name is required',
      type: 'any.required',
    },
  }
}
```

> Tip: After the validation runs and is successful, all attributes will be sanitized and keys not declared in your Joi schema will be automatically removed.  For more details please check the `stripUnknown`  option available in Joi.

## Initializers
Expressio provides a simple and powerful module system to customize your application. For naming convention, we call such modules as *initializers*.

Initializers are functions that accepts a single argument, the `server` object. See the example bellow:

```js
import Joi from '@hapi/joi'
import { sanitize } from 'expressio'

/**
 * Object schemas
 * to validate configuration
 */
const schema = Joi.object({
  enabled: Joi.boolean().required(),
  // Misc config...
})

export default (server) => {
  // If schema is not valid, the server will stop the whole
  // initialization process and provide a detailed error message
  const config = sanitize(server.config.foo, schema, 'Invalid Foo config')

  // If enabled attribute is not true, skip
  // loading the initializer
  if (!config.enabled) return

  const foo = {
    // Some API
  }

  // Expose Foo to the server object
  server.foo = foo

  // Expose Foo to the request object
  server.use((req, res, next) => {
    req.foo = foo
    next()
  })

  // Execute some logic before the server start
  server.events.on('beforeStart', srv => {
    // Logic to run after routes/middlewares/other initializers were loaded but before the server starts.
  })
}
```

To register your initializer you call the function `initializer` available in your app object.

```js
import expressio from 'expressio'
import foo from './foo'

const app = expressio()

app.initialize('foo', foo)

// ...Middlewares
// ...Routes

app.start()
```

## API 
When your app is instantiated, in addition of the regular ExpressJS functions and variables, you also have the following API available as part of Expressio:

### `app.start()`

Start the server after all initializers, routes and core middlewares were loaded.

### `app.initialize(name, fn)`

Register a custom initializer. For more details please check the initializers section.

- `name`: String representing the name of the initializer.
- `fn`: Function. The initializer function.

### `app.logger`

The logger object is a Winston instance that logs to the console and environment named files by default according to the current level configured in your config file. Please refer to the configuration section for more details.

### `app.logger.level(message)`

Current levels available:  error, warn, info, verbose, silly, debug.

- `message`: Any.

E.g.

```js
const app = expressio()

const { logger } = app

logger.info('A string')
logger.debug(new Error())
```

### `app.config`

The config object computed after the app is initialized. Please refer to the configuration section for more details.
 
### `app.events`

Async event emitter object. By default the app executes the following events as part of its lifecycle:

* **beforeStart**: Event executed right before the server is started. Usually used to append error handlers.
* **afterStart**: Event executed right after the server is started.
* **beforeStop**: Event executed right before the server is stopped.
* **afterStop**: Event executed right after the server is stopped.

### `app.events.on(event, cb)`

Adds an event listener.

- `event`:  any of beforeStart, afterStart, beforeStop, afterStop.
- `cb`: Function. The first argument is the server instance in its current state.

E.g.

```js
app.events.on('beforeStart', (server) => {
  // Logic to execute
})
```


### `app.stop()`

Function to stop the server.

### `app.instance`

The current HTTP server instance that is listening for connections. 
It is available after the server starts.

### Helpers

### `router`

The Express.JS router object. Usually used to create your routes and load them into the main server object.

E.g.

```js
import expressio, { router } from 'expressio'

const app = expressio()
const routes = router()

routes.get('/test', async (req, res) => {
  res.json({ route: 'test' })
})

routes.post('/data', async (req, res) => {
  res.json(req.body)
})

app.use('/namespace', routes)

app.start()
```

### `validateRequest(source, schema)`

Middleware that executes request data validation and returns formatted error objects in the response. For more details on how the validation works, check the validations section.

- `source`: String. Can be one of the following values: body, query or params.
- `schema`: Valid Joi schema.

### `httpError(code, [meta])`

Returns HTTP-friendly Error objects.

- `code`: String or number representing the status code. Invalid or not found error codes will fallback to `500`.
- `meta`: Object with extra information regarding the error. Possible options are `message`, `type` and `attributes`.

```js
httpError()

// Returns:
// Error Object {
//   stack...,
//   isHttp: true,
//   message: 'Internal Server Error'
//   output: {
//     message: 'Internal Server Error',
//     type: 'INTERNAL_SERVER_ERROR',
//     status: 500,
//   }
// }

httpError(400)

// Returns:
// Error Object {
//   stack...,
//   isHttp: true,
//   message: 'Bad Request'
//   output: {
//     message: 'Bad Request',
//     type: 'BAD_REQUEST',
//     status: 400,
//   }
// }

httpError(422, {
  message: 'Something is wrong with this validation',
  type: 'VALIDATION',
  attributes: {
    email: 'Email is invalid',
    name: 'Name is required'
  },
})

// Returns:
// Error Object {
//   stack...,
//   isHttp: true,
//   message: 'Something is wrong with this validation'
//   output: {
//     message: 'Something is wrong with this validation',
//     type: 'VALIDATION',
//     attributes: {
//       email: 'Email is invalid',
//       name: 'Name is required'
//     },
//     status: 422,
//   }
// }
```

## Contributing
Pull requests and stars are always welcome. For bugs and feature requests,  please create an [issue](https://github.com/hugw/expressio/issues).

---
The MIT License (MIT)

Copyright (c) 2017 Hugo W. - [contact@hugw.io](mailto:contact@hugw.io) 

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
