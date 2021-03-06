import Lkr from './Lkr'
import storageMock from './mocks/storageMock'

describe('Lkr', () => {
  let localStore, sessionStore, lkr

  beforeEach(() => {
    localStore = storageMock()
    sessionStore = storageMock()

    lkr = new Lkr({
      drivers: { local: localStore, session: sessionStore },
      driver: 'local',
      namespace: 'lkr',
      separator: '.'
    })
  })

  test('it should instantiate the class', () => {
    const l = new Lkr({
      drivers: { local: localStore, session: sessionStore },
      driver: 'local',
      namespace: 'lkr',
      separator: '.'
    })
  })

  test('it should throw an error if driver is not available', () => {
    const options = {
      drivers: { local: localStore, session: sessionStore },
      driver: 'foo',
      namespace: 'lkr',
      separator: '.'
    }

    const options2 = {
      drivers: {},
      driver: 'foo',
      namespace: 'lkr',
      separator: '.'
    }

    expect(() => new Lkr(options)).toThrowError('[lkr] Driver "foo" not available.')
    expect(() => new Lkr(options2)).toThrowError('[lkr] Driver "foo" not available.')
  })

  test('it should throw an error if driver is not supported', () => {
    const options = {
      drivers: { local: void 0 },
      driver: 'local',
      namespace: 'lkr',
      separator: '.'
    }

    expect(() => new Lkr(options)).toThrowError('[lkr] Driver "local" not supported.')
  })

  test('it should put an item into storage', () => {
    lkr.put('foo', 'bar')

    expect(lkr.store.getItem('lkr.foo')).toEqual('bar')
    expect(lkr.store.length).toEqual(1)
  })

  test('it should throw an error when attempting to put an undefined key', () => {
    expect(() => lkr.put()).toThrowError('[lkr] You must specify a key.')
  })

  test('it should throw an error when attempting to put an undefined value', () => {
    expect(() => lkr.put('foo')).toThrowError('[lkr] You must specify a value.')
  })

  test('it should put multiple items into storage when passing an object', () => {
    lkr.put({ foo: 'bar', baz: 'bob' })

    expect(lkr.store.getItem('lkr.foo')).toEqual('bar')
    expect(lkr.store.getItem('lkr.baz')).toEqual('bob')
    expect(lkr.store.length).toEqual(2)
  })

  test('it should put an item into storage when passing a function as key', () => {
    lkr.put(() => 'foo', 'bar')

    expect(lkr.store.getItem('lkr.foo')).toEqual('bar')
    expect(lkr.store.length).toEqual(1)
  })

  test('it should put an item into storage when passing a function as value', () => {
    lkr.put('foo', () => 'bar')
    lkr.put('bar', () => ({ baz: 'bob' }))

    expect(lkr.store.getItem('lkr.foo')).toBe('bar')
    expect(lkr.store.getItem('lkr.bar')).toEqual({ baz: 'bob' })
    expect(lkr.store.length).toEqual(2)
  })

  test('it should add an item to storage if it does not already exist', () => {
    lkr.put('foo', 'bar')
    let added1 = lkr.add('foo', 'baz')
    let added2 = lkr.add('baz', 'bob')

    expect(added1).toBeFalsy()
    expect(added2).toBeTruthy()
    expect(lkr.store.getItem('lkr.foo')).toBe('bar')
    expect(lkr.store.getItem('lkr.baz')).toBe('bob')
    expect(lkr.store.length).toEqual(2)
  })

  test('it should get an item', () => {
    lkr.put('foo', 'bar')

    expect(lkr.get('foo')).toBe('bar')
  })

  test('it should iterate over items', () => {
    lkr.put({
      foo: 'bar',
      baz: ['bob']
    })

    lkr.each((val, key) => {
      expect(lkr.get(key)).toEqual(val)
    })
  })

  test('it should count the items', () => {
    lkr.put({
      foo: 'bar',
      baz: ['bob']
    })

    expect(lkr.count()).toEqual(2)
  })

  test('it should empty', () => {
    lkr.put({
      foo: 'bar',
      baz: ['bob']
    })

    expect(lkr.empty().store.length).toEqual(0)
  })

  test('it should return the specified default value when requesting an item that does not exist', () => {
    lkr.put('somethingThatDoesExist', 'exists')

    let result1 = lkr.get('somethingThatDoesExist', 'defaultValue')
    let result2 = lkr.get('somethingElseThatDoesntExist', {
      foo: 'bar',
      bar: 123,
      baz: true
    })
    let result3 = lkr.get('somethingElseThatDoesntExist', false)
    let result4 = lkr.get('somethingElseThatDoesntExist', '')
    let result5 = lkr.get('somethingElseThatDoesntExist', 'NaN')
    let result6 = lkr.get('somethingElseThatDoesntExist', null)
    let result7 = lkr.get('somethingElseThatDoesntExist', 0)

    expect(result1).not.toBe('defaultValue')
    expect(result2).toEqual({ foo: 'bar', bar: 123, baz: true })
    expect(result3).toBe(false)
    expect(result4).toBe('')
    expect(result5).toBe('NaN')
    expect(result6).toBe(null)
    expect(result7).toBe(0)
  })

  test('it should pull an item', () => {
    lkr.put('foo', 'bar')

    expect(lkr.pull('foo')).toEqual('bar')
    expect(lkr.get('foo')).toBeUndefined()
  })

  test('it should get multiple items', () => {
    lkr.put('foo', 'bar')
    lkr.put('baz', 'bob')
    lkr.put('fred', 'jim')

    expect({ foo: 'bar', fred: 'jim' }).toEqual(lkr.get(['foo', 'fred']))
  })

  test('it should forget an item', () => {
    lkr.put('foo', 'bar')
    lkr.put('baz', 'bob')
    lkr.put('fred', 'jim')

    lkr.forget('baz')
    expect(lkr.store.length).toEqual(2)
  })

  test('it should forget multiple items', () => {
    lkr.put('foo', 'bar')
    lkr.put('baz', 'bob')
    lkr.put('fred', 'jim')

    lkr.forget(['foo', 'baz'])
    expect(lkr.store.length).toBe(1)
  })

  test('it should clean the namespace', () => {
    lkr
      .driver('session')
      .namespace('test.namespace')
      .put('test', 'testvalue')

    lkr
      .driver('session')
      .namespace('test.namespace')
      .clean()

    expect(lkr.keys().length).toEqual(0)
  })

  test('it should set the driver', () => {
    expect(lkr.options.driver).toBe('local')

    let l = lkr.driver('session')
    expect(l.options.driver).toBe('session')
  })

  test('it should set the namespace', () => {
    expect(lkr.options.namespace).toBe('lkr')

    let l = lkr.namespace('myApp')
    expect(l.options.namespace).toBe('myApp')
  })
})
