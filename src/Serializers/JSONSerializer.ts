import { Serializer } from '../Contracts'

/**
 * Serialize and Unserialize data
 */
const JSONSerializer: Serializer = {
  /**
   * Serialize the provided data.
   *
   * @param   {Mixed}  data  The data to serialize
   *
   * @return  {String}
   */
  serialize(data): string {
    try {
      return JSON.stringify(data)
    } catch (e) {
      return data
    }
  },

  /**
   * Unserialize the provided data.
   *
   * @param   {String}  payload  The payload to unserialize
   *
   * @return  {Mixed}
   */
  unserialize(payload: string) {
    try {
      return JSON.parse(payload)
    } catch (e) {
      return payload
    }
  }
}

export default JSONSerializer
