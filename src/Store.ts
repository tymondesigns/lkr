import JSONSerializer from './Serializers/JSONSerializer'
import { Serializer } from './Contracts'

/**
 * A decorator for a Storage implementation
 */
class Store {
  private driver: Storage

  private serializer: Serializer

  /**
   * Create a Store instance.
   *
   * @param   {Storage}  driver        The storage driver
   * @param   {Serializer}   [serializer]  The serializer to use
   *
   * @return  {void}
   */
  constructor(driver: Storage, serializer?: Serializer) {
    this.driver = driver
    this.serializer = serializer || JSONSerializer
  }

  /**
   * Add a key/value pair to storage
   *
   * @param  {String}  key  The key to add
   * @param  {Mixed}   val  The value to add
   *
   * @throws {Error}  If the storage access is disallowed.
   *
   * @return {Store}
   */
  setItem(key, val): Store {
    try {
      this.driver.setItem(key, this.serializer.serialize(val))
    } catch (e) {
      if (
        [
          'QUOTA_EXCEEDED_ERR',
          'NS_ERROR_DOM_QUOTA_REACHED',
          'QuotaExceededError'
        ].indexOf(e.name) !== -1
      ) {
        throw new Error('[lkr] The Storage quota has been exceeded')
      } else {
        throw new Error(`[lkr] Could not add item with key "${key}"`)
      }
    }

    return this
  }

  /**
   * Retrieve a value from storage by key
   *
   * @param  {String}  key  The key to retreive
   *
   * @return {Mixed}
   */
  getItem(key): any {
    return this.serializer.unserialize(this.driver.getItem(key))
  }

  /**
   * Determine whether the key exists in storage.
   *
   * @param   {String}   key  The key to check
   *
   * @return  {Boolean}
   */
  hasItem(key): boolean {
    return this.driver.hasOwnProperty(key) || !!this.getItem(key)
  }

  /**
   * Remove an item from storage.
   *
   * @param   {String}  key  The key to remove
   *
   * @return  {Boolean}
   */
  removeItem(key): boolean {
    if (!this.hasItem(key)) return false

    this.driver.removeItem(key)

    return true
  }

  /**
   * Remove all items from storage.
   *
   * @return  {Store}
   */
  clear(): Store {
    this.driver.clear()

    return this
  }

  /**
   * Iterate through the items in storage and execute the callback.
   *
   * @param   {Function}  callback            The callback function
   * @param   {Object}    [thisContext=this]  The context of this keyword
   *
   * @return  {void}
   */
  forEach(callback: Function, thisContext = this): void {
    for (let item in this.driver) {
      callback.call(thisContext, this.driver[item], item)
    }
  }

  /**
   * Determine whether the storage driver is supported.
   *
   * @return  {Boolean}
   */
  isSupported(): boolean {
    let l = 'l'
    try {
      this.driver.setItem(l, l)
      this.driver.removeItem(l)

      return true
    } catch (e) {
      return false
    }
  }

  /**
   * Get the number of items in storage.
   *
   * @return  {Integer}
   */
  get length(): number {
    return this.driver.length
  }
}

export default Store
