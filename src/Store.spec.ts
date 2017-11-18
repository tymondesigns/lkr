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
})
