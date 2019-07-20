import Joi from '@hapi/joi'

import utils from '@/utils'

const schema = Joi.object({
  foo: Joi.boolean().required(),
  bar: Joi.string().required(),
})

const object = { foo: true, bar: 'bar' }

describe('Expressio / Utils', () => {
  describe('#sanitize', () => {
    it('should sanitize the object successfully', () => {
      expect(utils.sanitize(object, schema)).toEqual(object)
    })

    it('should sanitize the object and strip unknown properties', () => {
      expect(utils.sanitize({ ...object, extra: true }, schema)).toEqual(object)
    })

    it('should throw an error if any of the properties are not valid', () => {
      expect(() => utils.sanitize({}, schema, 'Invalid test config')).toThrow('Invalid test config: "foo" is required')
    })

    it('given no message param and with invalid properties, it should throw an error with a default message set', () => {
      expect(() => utils.sanitize({}, schema)).toThrow('Invalid config: "foo" is required')
    })

    it('given an invalid object, it should throw an error with proper message', () => {
      expect(() => utils.sanitize(null, schema)).toThrow('Sanitize error: object provided is not valid')
    })

    it('given an invalid schema, it should throw an error with proper message', () => {
      expect(() => utils.sanitize({}, null)).toThrow('Sanitize error: schema provided is not a valid Joi schema')
    })
  })
})
