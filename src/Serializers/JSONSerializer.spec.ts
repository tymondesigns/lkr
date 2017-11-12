import JSONSerializer from './JSONSerializer'

describe('JSONSerializer', () => {
  test('it should serialize data as json', () => {
    let json = JSONSerializer.serialize({ foo: 'bar', baz: 'bob' })

    expect(json).toEqual('{"foo":"bar","baz":"bob"}')
  })

  test('it should unserialize json as data', () => {
    let data = JSONSerializer.unserialize('{"foo":"bar","baz":"bob"}')

    expect(data).toEqual({ foo: 'bar', baz: 'bob' })
  })
})
