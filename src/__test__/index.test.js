import ndtk from 'ndtk'
import expressio, {
  router,
  httpError,
  validate,
  assert,
  sanitize,
} from '@'

describe('Expressio', () => {
  it('should expose external dependencies & utility functions', () => {
    expect(httpError).toBeDefined()
    expect(router).toBeDefined()
    expect(validate).toBeDefined()
    expect(assert).toBeDefined()
    expect(sanitize).toBeDefined()
  })

  it('given a valid configuration, it should return an expressio object', () => {
    const app = expressio()

    expect(app.start).toBeDefined()
    expect(app.stop).toBeDefined()
    expect(app.config).toBeDefined()
    expect(app.initialize).toBeDefined()
    expect(app.logger).toBeDefined()
    expect(app.events).toBeDefined()
    expect(app.env).toBeDefined()
    expect(app.parentApp).toBeDefined()
    expect(app.isMounted).toBeDefined()
    expect(app.subApps).toBeDefined()
  })

  it('given no root path is found or provided, it should throw an error', () => {
    const spy = jest.spyOn(ndtk, 'ccd').mockImplementation(() => null)
    expect(() => expressio({ root: null })).toThrow('Application root path is invalid.')
    spy.mockRestore()
  })

  it('given unmet node version, it should throw an error', () => {
    const spy = jest.spyOn(ndtk, 'config').mockImplementation(() => ({ core: { engine: 20.0 } }))
    expect(() => expressio()).toThrowError('Current Node version is not supported.')
    spy.mockRestore()
  })

  it('should load environment variables', () => {
    expressio({ root: `${__dirname}/fixtures/core` })
    expect(process.env.LOADED).toEqual('yep')
  })

  it('should start the server properly and emit related events', async () => {
    const fn = jest.fn()
    const app = expressio()
    app.events.on('beforeStart', fn)
    app.events.on('afterStart', fn)

    expect(app.instance).toBeNull()
    await app.start()
    expect(app.instance).toBeDefined()
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should stop the server properly and emit related events', async () => {
    const fn = jest.fn()
    const app = expressio()
    app.events.on('beforeStop', fn)
    app.events.on('afterStop', fn)

    await app.start()
    expect(app.instance).toBeDefined()
    await app.stop()
    expect(app.instance).toBeNull()
    expect(fn).toHaveBeenCalledTimes(2)
  })

  describe('Sub Apps', () => {
    it('given a valid mounted sub app, it should expose proper server objects', () => {
      const app = expressio()
      const subApp = expressio({ name: 'foo' })
      app.use(subApp)

      expect(Object.keys(app.subApps)).toEqual(['foo'])
      expect(app.subApps.foo).toEqual(subApp)
      expect(app.isMounted).toBeFalsy()

      expect(subApp.parentApp).toEqual(app)
      expect(subApp.isMounted).toBeTruthy()
    })

    it('given a mounted sub app without name, it should throw an error', () => {
      const app = expressio()
      const subApp = expressio()

      expect(() => app.use(subApp)).toThrowError('Mounted sub apps requires a name.')
    })

    it('given a mounted sub app with a name already in use, it should throw an error', () => {
      const app = expressio()
      const subApp = expressio({ name: 'foo' })
      const subApp2 = expressio({ name: 'foo' })
      app.use(subApp)

      expect(() => app.use(subApp2)).toThrowError('Module name "foo" is already in use.')
    })
  })
})
