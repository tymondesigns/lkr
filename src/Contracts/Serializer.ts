export interface Serializer {
  serialize(data: any): string
  unserialize(payload: string): any
}
