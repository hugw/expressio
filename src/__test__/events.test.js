import events from '@/events'

describe('Expressio / Events Initializer', () => {
  const fn = jest.fn()

  afterEach(() => {
    fn.mockClear()
  })

  const subServer = { subApps: {} }

  const server = {
    subApps: {
      subServer,
    },
  }

  events(subServer)
  events(server)

  it('should load the initializer and expose an api to the server', () => {
    expect(Object.keys(server.events)).toEqual(['on', 'emit'])
  })

  describe('#on', () => {
    it('should register a new event successfully', () => {
      expect(server.events.on('onTest', fn)).toEqual()
    })

    it('given an invalid event, it should throw an error with proper message', () => {
      expect(() => server.events.on('')).toThrow('Events error: event is not a string')
      expect(() => server.events.on(1)).toThrow('Events error: event is not a string')
      expect(() => server.events.on(null)).toThrow('Events error: event is not a string')
      expect(() => server.events.on({})).toThrow('Events error: event is not a string')
      expect(() => server.events.on([])).toThrow('Events error: event is not a string')
    })

    it('given an invalid function, it should throw an error with proper message', () => {
      expect(() => server.events.on('onTest', '')).toThrow('Events error: "onTest" event has not a valid function')
      expect(() => server.events.on('onTest', 1)).toThrow('Events error: "onTest" event has not a valid function')
      expect(() => server.events.on('onTest', null)).toThrow('Events error: "onTest" event has not a valid function')
      expect(() => server.events.on('onTest', {})).toThrow('Events error: "onTest" event has not a valid function')
      expect(() => server.events.on('onTest', [])).toThrow('Events error: "onTest" event has not a valid function')
    })
  })

  describe('#emit', () => {
    it('should emit an event successfully', async () => {
      server.events.on('onEmit1', fn)
      server.events.on('onEmit1', fn)
      await server.events.emit('onEmit1', true, [], 'a string')
      expect(fn).toHaveBeenCalledTimes(2)
      expect(fn).toHaveBeenCalledWith(server, true, [], 'a string')
    })

    it('given no registered events, it should emit an event still', async () => {
      server.events.on('onEmit2', fn)
      await server.events.emit('onEmit22')
      expect(fn).toHaveBeenCalledTimes(0)
    })

    it('should return an array of values from resolved promises and sync functions', async () => {
      const prom = new Promise((res) => {
        setTimeout(() => {
          res('I am late')
        }, 500)
      })

      server.events.on('onEmit3', () => [])
      server.events.on('onEmit3', () => Promise.resolve(true))
      server.events.on('onEmit3', () => prom)
      server.events.on('onEmit3', () => Promise.resolve('foo'))
      server.events.on('onEmit3', () => 'bar')
      subServer.events.on('onEmit3', () => 'bar from sub app')
      subServer.events.on('onEmit3', () => Promise.resolve('foo from sub app'))
      const res = await server.events.emit('onEmit3')
      expect(res).toEqual([[], true, 'I am late', 'foo', 'bar', ['bar from sub app', 'foo from sub app']])
    })

    it('given an invalid event, it should throw an error with proper message', () => {
      expect(() => server.events.emit('')).toThrow('Events error: event is not a string')
      expect(() => server.events.emit(1)).toThrow('Events error: event is not a string')
      expect(() => server.events.emit(null)).toThrow('Events error: event is not a string')
      expect(() => server.events.emit({})).toThrow('Events error: event is not a string')
      expect(() => server.events.emit([])).toThrow('Events error: event is not a string')
    })
  })
})
