import { legacy } from './standard'
import { modern } from './standard'
import { skkm } from './skkm'

const factories = [
  legacy,
  modern,
  skkm
]

export const of = options => {
  const factory = factories.find(factory => factory.accept(options))
  if (!factory) return

  const [size, svg] = factory.document(options)
  return {
    size: () => size,
    asSVG: () => svg
  }
}
