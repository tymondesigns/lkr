
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

export default check;
