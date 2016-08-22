import { type, value } from 'chitu';
import Store from './Store';

/**
 * A Fluent Storage API.
 *
 * @author Sean Tymon <tymon148@gmail.com>
 */
class Locker {

    /**
     * Create a Locker instance.
     *
     * @param   {Object}  options            The configuration options
     * @param   {Object}  options.drivers    The storage drivers
     * @param   {String}  options.driver     The default storage driver
     * @param   {String}  options.namespace  The namespace
     * @param   {String}  options.separator  The string that separates the namespace and key
     *
     * @return  {void}
     */
    constructor (options) {

        /**
         * The configuration options.
         *
         * @type  {Object}
         */
        this.opts = options;

        /**
         * Throw a namespaced Error.
         *
         * @param  {String}  msg  The error message
         *
         * @private
         *
         * @throws {Error}
         *
         * @return {void}
         */
        this._err = (msg) => {
            throw new Error(`[locker] ${msg}`);
        };

        /**
         * The Store instance.
         *
         * @private
         *
         * @type {Store}
         */
        this._store = ((driver, self) => {
            if (! Object.keys(options.drivers).length || ! options.drivers.hasOwnProperty(driver)) {
                self._err(`Driver "${driver}" not available.`);
            }

            let store = new Store(options.drivers[driver]);

            if (! store.isSupported()) {
                self._err(`Driver "${driver}" not supported.`);
            }

            return store;
        })(options.driver, this);

        /**
         * Get the fully qualified key.
         *
         * @private
         *
         * @param  {String}  key  The key
         *
         * @return {String}
         */
        this._getKey = (key) => options.namespace ? `${options.namespace}${options.separator}${key}` : key;
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
     * Get the store instance.
     *
     * @return {Store}
     */
    get store () {
        return this._store;
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
     * @return {Locker}
     */
    put (key, val, def) {
        if (type.isUndefined(key)) this._err('You must specify a key.');
        key = value(key);

        if (type.isObject(key)) {
            for (let item in key) {
                let v = value(key[item]);
                this._store.setItem(this._getKey(item), type.isUndefined(v) ? def : v);
            }
        } else {
            if (type.isUndefined(val)) this._err('You must specify a value.');
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
     * @param  {String|Function|Object}  key      The key to add
     * @param  {Mixed}                   value    The value to add
     * @param  {Mixed}                   [def]    The default to pass to function if doesn't already exist
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
     * @param  {String|Array|Function}  key    The key to get
     * @param  {Mixed}                  [def]  The default value if it does not exist
     *
     * @return {Mixed}
     */
    get (key, def) {
        key = value(key);

        if (type.isArray(key)) {
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

        if (type.isArray(key)) {
            key.map(this.forget, this);
        } else {
            this._store.removeItem(this._getKey(key));
        }

        return this;
    }

    /**
     * Retrieve the specified item from storage and then remove it
     *
     * @param  {String|Array}  key    The key to pull from storage
     * @param  {Mixed}         [def]  The default value if it does not exist
     *
     * @return {Mixed}
     */
    pull (key, def) {
        let value = this.get(key, def);
        this.forget(key);

        return value;
    }

    /**
     * Get all the items in storage within the currently set namespace/driver.
     *
     * @return  {Object}
     */
    all () {
        let items = {};
        this._store.forEach((val, key) => {
            if (this.opts.namespace) {
                let prefix = this.opts.namespace + this.opts.separator;
                if (key.indexOf(prefix) === 0) key = key.substring(prefix.length);
            }
            if (this.has(key)) items[key] = this.get(key);
        }, this);

        return items;
    }

    /**
     * Iterate through the items within the current namespace/driver and execute the callback.
     *
     * @param   {Function}  callback            The callback function
     * @param   {Object}    [thisContext=this]  The context of this keyword
     *
     * @return  {void}
     */
    each (callback, thisContext = this) {
        let items = this.all();
        for (let item in items) {
            callback.call(thisContext, items[item], item);
        }
    }

    /**
     * Get the storage keys as an array.
     *
     * @return {Array}
     */
    keys () {
        return Object.keys(this.all());
    }

    /**
     * Remove all items set within the current namespace/driver.
     *
     * @return {Locker}
     */
    clean () {
        return this.forget(this.keys());
    }

    /**
     * Empty the current storage driver completely. Careful now.
     *
     * @return {Locker}
     */
    empty () {
        this._store.clear();

        return this;
    }

    /**
     * Get the total number of items within the current namespace/driver.
     *
     * @return {Integer}
     */
    count () {
        return this.keys().length;
    }

    /**
     * Set the driver by key.
     *
     * @param   {String}  driver  The driver key
     *
     * @return  {Locker}
     */
    driver (driver) {
        return Locker.make({ ...this.opts, driver });
    }

    /**
     * Set the namespace.
     *
     * @param   {String}  namespace  The namespace
     *
     * @return  {Locker}
     */
    namespace (namespace) {
        return Locker.make({ ...this.opts, namespace });
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

}

export default Locker;
