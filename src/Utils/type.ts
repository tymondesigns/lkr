const type: any = {},
  types = 'Array Object String Date RegExp Function Boolean Number Error Null Undefined'.split(
    ' '
  )

/**
 * Check the type of a value.
 *
 * @param  {String}  type  The primitive type as a capitalized string.
 * @param  {Mixed}   val   The value to check.
 *
 * @return {Boolean}
 */
type.is = (type: string, val) =>
  Object.prototype.toString.call(val).slice(8, -1) === type

// Populate helper methods.
types.forEach(t => (type[`is${t}`] = v => type.is(t, v)))

export default type
