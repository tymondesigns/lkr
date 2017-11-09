import { Serializer } from './Serializer'

export interface LkrOptions {
  drivers: object
  driver: string
  namespace: string
  separator: string
  serializer?: Serializer
}
