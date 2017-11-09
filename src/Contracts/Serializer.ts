export interface Serializer {
  serialize(data: any)
  unserialize(payload: string)
}
