import JSONSerializer from './Serializers/JSONSerializer'
import { Serializer } from './Contracts'

/**
 * A decorator for a Storage implementation
 */
class Store {
  /**
   * The driver instance
   */
  private driver: Storage

  /**
   * The Serializer instance
   */
  private serializer: Serializer

  /**
   * Create a Store instance.
   */
  constructor(driver: Storage, serializer?: Serializer) {
    this.driver = driver
    this.serializer = serializer || JSONSerializer
  }

  /**
   * Add a key/value pair to storage
   */
  setItem(key: string, val: any): Store {
    try {
      this.driver.setItem(key, this.serializer.serialize(val))
    } catch (e) {
      if (
        ['QUOTA_EXCEEDED_ERR', 'NS_ERROR_DOM_QUOTA_REACHED', 'QuotaExceededError'].indexOf(
          e.name
        ) !== -1
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
   */
  getItem(key: string): any {
    return this.serializer.unserialize(this.driver.getItem(key))
  }

  /**
   * Determine whether the key exists in storage.
   */
  hasItem(key: string): boolean {
    return this.driver.hasOwnProperty(key)
  }

  /**
   * Remove an item from storage.
   */
  removeItem(key: string): boolean {
    if (!this.hasItem(key)) return false

    this.driver.removeItem(key)

    return true
  }

  /**
   * Remove all items from storage.
   */
  clear(): Store {
    this.driver.clear()

    return this
  }

  /**
   * Iterate through the items in storage and execute the callback.
   */
  forEach(callback: Function, thisContext: object = this): void {
    for (let item in this.driver) {
      callback.call(thisContext, this.driver[item], item)
    }
  }

  /**
   * Determine whether the storage driver is supported.
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
   */
  get length(): number {
    return this.driver.length
  }
}

export default Store
