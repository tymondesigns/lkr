import { Serializer } from '../Contracts'

/**
 * Serialize and Unserialize data
 */
const JSONSerializer: Serializer = {
  /**
   * Serialize the provided data.
   */
  serialize(data: any): string {
    try {
      return JSON.stringify(data)
    } catch (e) {
      return data
    }
  },

  /**
   * Unserialize the provided data.
   */
  unserialize(payload: string): any {
    try {
      return JSON.parse(payload)
    } catch (e) {
      return payload
    }
  }
}

export default JSONSerializer
