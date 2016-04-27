import check from './utils/check';
import value from './utils/value';
import Store from './drivers/Store';

/**
 * A Fluent Storage API
 *
 * @author Sean Tymon <tymon148@gmail.com>
 */
class Locker {

    /**
     * Create a Locker instance.
     *
     * @param   {Object}  options  The configuration options
     *
     * @return  {void}
     */
    constructor (options) {

        /**
         * The configuration options
         *
         * @type  {Object}
         */
        this.opts = options;

        /**
         * The registered drivers
         *
         * @private
         *
         * @type  {Object}
         */
        this._registeredDrivers = Object.assign({}, options.drivers);

        /**
         * The Store instance
         *
         * @private
         *
         * @type {Store}
         */
        this._store = (driver => {
            if (! Object.keys(this._registeredDrivers).length || ! this._registeredDrivers.hasOwnProperty(driver)) {
                throw new Error(`Driver "${driver}" not available.`);
            }

            let store = new Store(this._registeredDrivers[driver]);

            if (! store.isSupported()) {
                throw new Error(`Driver "${driver}" not supported.`);
            }

            return store;
        })(options.driver);

        /**
         * Get the fully qualified key.
         *
         * @private
         *
         * @param  {String}  key  The key
         *
         * @return {String}
         */
        this._getKey = (key) => {
            if (! options.namespace) return key;

            return `${options.namespace}${options.separator}${key}`;
        };
    }

    /**
     * Get the configuration options.
     *
     * @return  {Object}
     */
    get options () {
        return this.opts;
    }

    /**
     * Add a new item to storage even if it already exists.
     *
     * @param  {String|Function|Object}  key  The key to add
     * @param  {Mixed}                   val  The value to add
     * @param  {Mixed}                   def  The default to pass to function if doesn't already exist
     *
     * @throws {Error}  If a key or value is not provided
     *
     * @return {Locker}
     */
    put (key, val, def) {
        if (check.isUndefined(key)) throw new Error('You must specify a key.');
        key = value(key);

        if (check.isObject(key)) {
            for (let item in key) {
                let v = value(key[item]);
                this._store.setItem(this._getKey(item), check.isUndefined(v) ? def : v);
            }
        } else {
            if (check.isUndefined(val)) throw new Error('You must specify a value.');
            this._store.setItem(
                this._getKey(key),
                value(val, this.get(key, def))
            );
        }

        return this;
    }

    /**
     * Add an item to storage if it doesn't already exist.
     *
     * @param  {String|Function|Object}  key    The key to add
     * @param  {Mixed}                   value  The value to add
     * @param  {Mixed}                   def    The default to pass to function if doesn't already exist
     *
     * @return {Boolean}  Whether the item was added or not
     */
    add (key, value, def) {
        if (! this.has(key)) {
            this.put(key, value, def);

            return true;
        }

        return false;
    }

    /**
     * Retrieve the specified item from storage.
     *
     * @param  {String|Array|Function}  key  The key to get
     * @param  {Mixed}                  def  The default value if it does not exist
     *
     * @return {Mixed}
     */
    get (key, def) {
        key = value(key);

        if (check.isArray(key)) {
            let items = {};
            for (let k of key) {
                items[k] = this.get(k, def);
            }

            return items;
        }

        if (! this.has(key)) return arguments.length === 2 ? def : void 0;

        return this._store.getItem(this._getKey(key));
    }

    /**
     * Determine whether the item exists in storage.
     *
     * @param  {String|Function}  key  The key to remove
     *
     * @return {Boolean}
     */
    has (key) {
        return this._store.hasItem(value(this._getKey(key)));
    }

    /**
     * Remove specified item(s) from storage.
     *
     * @param  {String|Array|Function}  key  The key or array of keys to remove
     *
     * @return {Locker}
     */
    forget (key) {
        key = value(key);

        if (check.isArray(key)) {
            key.map(this.forget, this);
        } else {
            this._store.removeItem(this._getKey(key));
        }

        return this;
    }

    /**
     * Set the driver by key.
     *
     * @param   {String}  driver  The driver key
     *
     * @return  {Locker}
     */
    driver (driver) {
        return Locker.make(Object.assign(this.opts, { driver }));
    }

    /**
     * Set the namespace.
     *
     * @param   {String}  namespace  The namespace
     *
     * @return  {Locker}
     */
    namespace (namespace) {
        return Locker.make(Object.assign(this.opts, { namespace }));
    }

    /**
     * Create a new instance of Locker.
     *
     * @param   {Object}  options  The configuration options
     *
     * @return  {Locker}
     */
    static make (options) {
        return new Locker(options);
    }

    /**
     * Get the storage driver instance.
     *
     * @return {Store}
     */
    getStore () {
        return this._store;
    }

    /**
     * Get the storage namespace.
     *
     * @return {String}
     */
    getNamespace () {
        return this.opts.namespace;
    }

    /**
     * Get the namespace separator.
     *
     * @return {String}
     */
    getSeparator () {
        return this.opts.separator;
    }

}

export default Locker;
