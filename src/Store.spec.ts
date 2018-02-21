import Store from './Store'
import storageMock from './mocks/storageMock'

describe('Store', () => {
  let driver, store

  beforeEach(() => {
    driver = storageMock()

    store = new Store(driver)
  })

  it('should set an item in storage', () => {
    store.setItem('foo', 'bar')

    expect(driver.getItem('foo')).toEqual('"bar"')
  })

  it('should get an item from storage', () => {
    store.setItem('foo', 'bar')

    expect(store.getItem('foo')).toEqual('bar')
  })

  it('should determine if an item exists in storage', () => {
    store.setItem('foo', 'bar')

    expect(store.hasItem('foo')).toBeTruthy()
    expect(store.hasItem('baz')).toBeFalsy()
  })

  it('should remove an item from storage', () => {
    store.setItem('foo', 'bar').removeItem('foo')

    expect(store.hasItem('foo')).toBeFalsy()
  })

  it('should remove all items from storage', () => {
    store
      .setItem('foo', 'bar')
      .setItem('baz', 'bob')
      .clear()

    expect(store.length).toEqual(0)
  })

  it('should determine if a storage driver is supported', () => {
    expect(store.isSupported()).toBeTruthy()
  })

  it('should determine if a storage driver is supported if error is thrown', () => {
    const spy = jest.spyOn(driver, 'setItem').mockImplementationOnce(() => {
      throw new Error('nope')
    })

    expect(store.isSupported()).toBeFalsy()

    spy.mockReset()
  })

  it('should throw an error if the storage quota has been exceeded', () => {
    const spy = jest.spyOn(driver, 'setItem').mockImplementationOnce(() => {
      let error = new Error()
      error.name = 'QUOTA_EXCEEDED_ERR'
      throw error
    })

    expect(() => store.setItem('foo', 'bar')).toThrowError(
      '[lkr] The Storage quota has been exceeded'
    )

    spy.mockReset()
  })

  it('should throw an error if their is a driver error', () => {
    const spy = jest.spyOn(driver, 'setItem').mockImplementationOnce(() => {
      throw new Error()
    })

    expect(() => store.setItem('foo', 'bar')).toThrowError(
      '[lkr] Could not add item with key "foo"'
    )

    spy.mockReset()
  })
})
