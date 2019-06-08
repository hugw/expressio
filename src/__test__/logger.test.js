import logger from '@/logger'

describe('Expressio / Logger Initializer', () => {
  const use = jest.fn()

  const config = {
    silent: false,
    level: 'info',
    prettify: true,
  }

  afterEach(() => {
    use.mockClear()
  })

  it('should load the initializer and expose an api to the server', () => {
    const server = { use }
    logger(server, config)

    expect(server.logger.level).toEqual(config.level)
    expect(server.logger.error).toBeDefined()
    expect(server.logger.info).toBeDefined()
    expect(server.logger.warn).toBeDefined()
    expect(server.logger.debug).toBeDefined()
    expect(use).toHaveBeenCalledTimes(2)
  })

  it('given no "silent" config, it should throw an error with proper message', () => {
    const fn = () => logger({}, { ...config, silent: undefined })
    expect(fn).toThrow('Invalid Logger config: "silent" is required')
  })

  it('given no "level" config, it should throw an error with proper message', () => {
    const fn = () => logger({}, { ...config, level: undefined })
    expect(fn).toThrow('Invalid Logger config: "level" is required')
  })

  it('given no "prettify" config, it should throw an error with proper message', () => {
    const fn = () => logger({}, { ...config, prettify: undefined })
    expect(fn).toThrow('Invalid Logger config: "prettify" is required')
  })
})
