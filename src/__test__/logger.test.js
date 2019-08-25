import logger from '@/logger/initializer'

describe('Expressio / Logger Initializer', () => {
  const use = jest.fn()

  const config = attrs => ({
    config: {
      core: {
        logger: {
          silent: false,
          level: 'info',
          prettify: true,
          transports: ['console', 'file'],
          ...attrs,
        },
      },
    },
  })

  afterEach(() => {
    use.mockClear()
  })

  it('should load the initializer and expose an api to the server', () => {
    const server = { use, ...config() }
    logger(server)

    expect(server.logger.instance.level).toEqual('info')
    expect(server.logger.error).toBeDefined()
    expect(server.logger.info).toBeDefined()
    expect(server.logger.warn).toBeDefined()
    expect(server.logger.debug).toBeDefined()
    expect(use).toHaveBeenCalledTimes(1)
  })

  it('given no "silent" config, it should throw an error with proper message', () => {
    const fn = () => logger(config({ silent: undefined }))
    expect(fn).toThrow('Invalid Logger config: "silent" is required')
  })

  it('given no "level" config, it should throw an error with proper message', () => {
    const fn = () => logger(config({ level: undefined }))
    expect(fn).toThrow('Invalid Logger config: "level" is required')
  })

  it('given no "prettify" config, it should throw an error with proper message', () => {
    const fn = () => logger(config({ prettify: undefined }))
    expect(fn).toThrow('Invalid Logger config: "prettify" is required')
  })

  it('given no "transports" config, it should throw an error with proper message', () => {
    const fn = () => logger(config({ transports: undefined }))
    expect(fn).toThrow('Invalid Logger config: "transports" is required')
  })

  it('given invalid "transports" config, it should throw an error with proper message', () => {
    const fn = () => logger(config({ transports: [123] }))
    expect(fn).toThrow('Invalid Logger config: "0" must be a string')
  })
})
