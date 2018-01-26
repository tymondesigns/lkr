import { type, value } from 'chitu'
import { LkrOptions } from './Contracts'
import Store from './Store'

/**
 * A Fluent Storage API.
 */
class Lkr {
  /**
   * The configuration options.
   */
  private opts: LkrOptions

  /**
   * The Store instance.
   */
  private store: Store

  /**
   * Create a Lkr instance.
   */
  constructor(options: LkrOptions) {
    /**
     * The configuration options.
     */
    this.opts = options

    /**
     * The Store instance.
     */
    this.store = ((driver: string, self: Lkr): Store => {
      if (!options.drivers.hasOwnProperty(driver)) {
        throw new Error(`[lkr] Driver "${driver}" not available.`)
      }

      let store = new Store(options.drivers[driver], options.serializer)

      if (!store.isSupported()) {
        throw new Error(`[lkr] Driver "${driver}" not supported.`)
      }

      return store
    })(options.driver, this)
  }

  /**
   * Get the options.
   */
  get options(): LkrOptions {
    return this.opts
  }

  /**
   * Get the prefix.
   */
  private get prefix(): string {
    return `${this.opts.namespace}${this.opts.separator}`
  }

  /**
   * Get the fully qualified key.
   */
  private getKey(key: string): string {
    return this.opts.namespace ? `${this.prefix}${key}` : key
  }

  /**
   * Add a new item to storage even if it already exists.
   */
  put(key, val: any, def?: any): Lkr {
    if (type.isUndefined(key)) throw new Error('[lkr] You must specify a key.')
    key = value(key)

    if (type.isObject(key)) {
      for (let item in key) {
        let v = value(key[item])
        this.store.setItem(this.getKey(item), type.isUndefined(v) ? def : v)
      }
    } else {
      if (type.isUndefined(val)) throw new Error('[lkr] You must specify a value.')
      this.store.setItem(this.getKey(key), value(val, this.get(key, def)))
    }

    return this
  }

  /**
   * Add an item to storage if it doesn't already exist.
   */
  add(key, value: any, def?: any): boolean {
    if (!this.has(key)) {
      this.put(key, value, def)

      return true
    }

    return false
  }

  /**
   * Retrieve the specified item from storage.
   */
  get(key, def?: any): any {
    key = value(key)

    if (type.isArray(key)) {
      let items = {}
      for (let k of key) {
        items[k] = this.get(k, def)
      }

      return items
    }

    if (!this.has(key)) return arguments.length === 2 ? def : void 0

    return this.store.getItem(this.getKey(key))
  }

  /**
   * Determine whether the item exists in storage.
   */
  has(key): boolean {
    return this.store.hasItem(value(this.getKey(key)))
  }

  /**
   * Remove specified item(s) from storage.
   */
  forget(key): Lkr {
    key = value(key)

    if (type.isArray(key)) {
      key.map(this.forget, this)
    } else {
      this.store.removeItem(this.getKey(key))
    }

    return this
  }

  /**
   * Retrieve the specified item from storage and then remove it
   */
  pull(key, def?: any): any {
    let value = this.get(key, def)
    this.forget(key)

    return value
  }

  /**
   * Get all the items in storage within the currently set namespace/driver.
   */
  all(): object {
    let items = {}
    this.store.forEach((val, key) => {
      if (this.opts.namespace) {
        if (key.indexOf(this.prefix) === 0) key = key.substring(this.prefix.length)
      }
      if (this.has(key)) items[key] = this.get(key)
    }, this)

    return items
  }

  /**
   * Iterate through the items within the current namespace/driver
   * and execute the callback.
   */
  each(callback: Function, thisContext: object = this): void {
    let items = this.all()
    for (let item in items) {
      callback.call(thisContext, items[item], item)
    }
  }

  /**
   * Get the storage keys as an array.
   */
  keys(): string[] {
    return Object.keys(this.all())
  }

  /**
   * Remove all items set within the current namespace/driver.
   */
  clean(): Lkr {
    return this.forget(this.keys())
  }

  /**
   * Empty the current storage driver completely. Careful now.
   */
  empty(): Lkr {
    this.store.clear()

    return this
  }

  /**
   * Get the total number of items within the current namespace/driver.
   */
  count(): number {
    return this.keys().length
  }

  /**
   * Set the driver by key.
   */
  driver(driver: string): Lkr {
    return Lkr.make({ ...this.opts, driver })
  }

  /**
   * Set the namespace.
   */
  namespace(namespace: string): Lkr {
    return Lkr.make({ ...this.opts, namespace })
  }

  /**
   * Create a new instance of Lkr.
   */
  static make(options: LkrOptions): Lkr {
    return new Lkr(options)
  }
}

export default Lkr
