import JSONSerializer from './JSONSerializer'

describe('JSONSerializer', () => {
  test('it should serialize data as json', () => {
    let json = JSONSerializer.serialize({ foo: 'bar', baz: 'bob' })

    expect(json).toEqual('{"foo":"bar","baz":"bob"}')
  })

  test('it should fallback gracefully when serialization did not occur', () => {
    let obj = { foo: 'bar', baz: 'bob' }
    const spy = jest.spyOn(JSON, 'stringify').mockImplementationOnce(() => {
      throw new Error('nope')
    })

    let json = JSONSerializer.serialize(obj)

    expect(json).toEqual(obj)

    spy.mockReset()
  })

  test('it should unserialize json as data', () => {
    let data = JSONSerializer.unserialize('{"foo":"bar","baz":"bob"}')

    expect(data).toEqual({ foo: 'bar', baz: 'bob' })
  })

  test('it should fallback gracefully when unserialization did not occur', () => {
    let data = '{"foo":"bar","baz":"bob"}'
    const spy = jest.spyOn(JSON, 'parse').mockImplementationOnce(() => {
      throw new Error('nope')
    })

    let json = JSONSerializer.unserialize(data)

    expect(data).toEqual(json)

    spy.mockReset()
  })
})
