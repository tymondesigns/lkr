
/**
 * Module for checking variable types.
 *
 * @module check
 */
const check = {},
    types = 'Array Object String Date RegExp Function Boolean Number Null Undefined Symbol'.split(' '),
    getType = elem => Object.prototype.toString.call(elem).slice(8, -1);

for (let type of types) {
    check[`is${type}`] = (self => elem => getType(elem) === self)(type);
}

/**
 * Check if we are in a NodeJS environment
 */
check.envNode = (self => elem => typeof process === 'object' && getType(elem) === self)('process');

export default check;
