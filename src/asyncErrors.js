/**
 * @copyright David Banham
 * @link https://github.com/davidbanham/express-async-errors/blob/master/index.js
 */

const Layer = require('express/lib/router/layer')
const Router = require('express/lib/router')

const last = (arr = []) => arr[arr.length - 1]
const noop = Function.prototype

function copyFnProps(oldFn, newFn) {
  Object.keys(oldFn).forEach((key) => {
    newFn[key] = oldFn[key]
  })
  return newFn
}

function wrap(fn) {
  const newFn = function newFn(...args) {
    const ret = fn.apply(this, args)
    const next = (args.length === 5 ? args[2] : last(args)) || noop
    if (ret && ret.catch) ret.catch(err => next(err))
    return ret
  }
  Object.defineProperty(newFn, 'length', {
    value: fn.length,
    writable: false,
  })
  return copyFnProps(fn, newFn)
}

function patchRouterParam() {
  const originalParam = Router.prototype.constructor.param
  Router.prototype.constructor.param = function param(name, fn) {
    return originalParam.call(this, name, wrap(fn))
  }
}

Object.defineProperty(Layer.prototype, 'handle', {
  enumerable: true,
  configurable: true,
  get() {
    return this.fn
  },
  set(fn) {
    this.fn = wrap(fn)
  },
})

patchRouterParam()
