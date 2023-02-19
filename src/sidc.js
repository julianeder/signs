import Legacy from './legacy'
import Modern from './modern'

export const SIDC = {}

SIDC.of = code => {
  const [sidc, standard] = code.split('+')
  return sidc.length === 20
    ? new Modern(sidc, standard)
    : new Legacy(sidc, standard)
}
