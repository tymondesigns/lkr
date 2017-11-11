import { type, value } from './Utils'
import { LkrOptions } from './Contracts'
import Store from './Store'

/**
 * A Fluent Storage API.
 */
class Lkr {
  /**
   * @ype {LkrOptions}
   */
  private opts: LkrOptions

  /**
   *
   */
  private store

  /**
   * Create a Lkr instance.
   *
   * @param   {Object}  options               The configuration options
   * @param   {Object}  options.drivers       The storage drivers
   * @param   {String}  options.driver        The default storage driver
   * @param   {String}  options.namespace     The namespace
   * @param   {String}  options.separator     The string that separates the namespace and key
   * @param   {Object}  [options.serializer]  The serializer to use
   *
   * @return  {void}
   */
  constructor(options: LkrOptions) {
    /**
     * The configuration options.
     *
     * @type  {LkrOptions}
     */
    this.opts = options

    /**
     * The Store instance.
     *
     * @private
     *
     * @type {Store}
     */
    this.store = ((driver, self) => {
      if (
        !Object.keys(options.drivers).length ||
        !options.drivers.hasOwnProperty(driver)
      ) {
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
   *
   * @return {LkrOptions}
   */
  get options(): LkrOptions {
    return this.opts
  }

  /**
   * Get the fully qualified key.
   *
   * @private
   *
   * @param  {String}  key  The key
   *
   * @return {String}
   */
  private getKey(key: string) {
    let { namespace, separator } = this.opts

    return namespace ? `${namespace}${separator}${key}` : key
  }

  /**
   * Add a new item to storage even if it already exists.
   *
   * @param  {String|Function|Object}  key    The key to add
   * @param  {Mixed}                   val    The value to add
   * @param  {Mixed}                   [def]  The default to pass to function if doesn't already exist
   *
   * @throws {Error}  If a key or value is not provided
   *
   * @return {Lkr}
   */
  put(key, val, def?) {
    if (type.isUndefined(key)) throw new Error('[lkr] You must specify a key.')
    key = value(key)

    if (type.isObject(key)) {
      for (let item in key) {
        let v = value(key[item])
        this.store.setItem(this.getKey(item), type.isUndefined(v) ? def : v)
      }
    } else {
      if (type.isUndefined(val))
        throw new Error('[lkr] You must specify a value.')
      this.store.setItem(this.getKey(key), value(val, this.get(key, def)))
    }

    return this
  }

  /**
   * Add an item to storage if it doesn't already exist.
   *
   * @param  {String|Function|Object}  key      The key to add
   * @param  {Mixed}                   value    The value to add
   * @param  {Mixed}                   [def]    The default to pass to function if doesn't already exist
   *
   * @return {Boolean}  Whether the item was added or not
   */
  add(key, value, def?): boolean {
    if (!this.has(key)) {
      this.put(key, value, def)

      return true
    }

    return false
  }

  /**
   * Retrieve the specified item from storage.
   *
   * @param  {String|Array|Function}  key    The key to get
   * @param  {Mixed}                  [def]  The default value if it does not exist
   *
   * @return {Mixed}
   */
  get(key, def?) {
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
   *
   * @param  {String|Function}  key  The key to remove
   *
   * @return {Boolean}
   */
  has(key): boolean {
    return this.store.hasItem(value(this.getKey(key)))
  }

  /**
   * Remove specified item(s) from storage.
   *
   * @param  {String|Array|Function}  key  The key or array of keys to remove
   *
   * @return {Lkr}
   */
  forget(key) {
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
   *
   * @param  {String|Array}  key    The key to pull from storage
   * @param  {Mixed}         [def]  The default value if it does not exist
   *
   * @return {Mixed}
   */
  pull(key, def) {
    let value = this.get(key, def)
    this.forget(key)

    return value
  }

  /**
   * Get all the items in storage within the currently set namespace/driver.
   *
   * @return  {Object}
   */
  all(): object {
    let items = {}
    this.store.forEach((val, key) => {
      if (this.opts.namespace) {
        let prefix = this.opts.namespace + this.opts.separator
        if (key.indexOf(prefix) === 0) key = key.substring(prefix.length)
      }
      if (this.has(key)) items[key] = this.get(key)
    }, this)

    return items
  }

  /**
   * Iterate through the items within the current namespace/driver and execute the callback.
   *
   * @param   {Function}  callback            The callback function
   * @param   {Object}    [thisContext=this]  The context of this keyword
   *
   * @return  {void}
   */
  each(callback: Function, thisContext = this) {
    let items = this.all()
    for (let item in items) {
      callback.call(thisContext, items[item], item)
    }
  }

  /**
   * Get the storage keys as an array.
   *
   * @return {Array}
   */
  keys(): string[] {
    return Object.keys(this.all())
  }

  /**
   * Remove all items set within the current namespace/driver.
   *
   * @return {Lkr}
   */
  clean() {
    return this.forget(this.keys())
  }

  /**
   * Empty the current storage driver completely. Careful now.
   *
   * @return {Lkr}
   */
  empty() {
    this.store.clear()

    return this
  }

  /**
   * Get the total number of items within the current namespace/driver.
   *
   * @return {Integer}
   */
  count(): number {
    return this.keys().length
  }

  /**
   * Set the driver by key.
   *
   * @param   {String}  driver  The driver key
   *
   * @return  {Lkr}
   */
  driver(driver: string) {
    return Lkr.make({ ...this.opts, driver })
  }

  /**
   * Set the namespace.
   *
   * @param   {String}  namespace  The namespace
   *
   * @return  {Lkr}
   */
  namespace(namespace: string) {
    return Lkr.make({ ...this.opts, namespace })
  }

  /**
   * Create a new instance of Lkr.
   *
   * @param   {Object}  options  The configuration options
   *
   * @return  {Lkr}
   */
  static make(options: LkrOptions) {
    return new Lkr(options)
  }
}

export default Lkr
