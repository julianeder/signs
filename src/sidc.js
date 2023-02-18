import * as R from 'ramda'
import Legacy from './legacy'
import Modern from './modern'

export const SIDC = {}

SIDC.of = code => {
  const [sidc, standard] = code.split('+')
  return sidc.length === 20
    ? new Modern(sidc, standard)
    : new Legacy(sidc, standard)
}

SIDC.format = R.curry((options, code) => {
  const [sidc, standard] = code.split('+')
  const formatted = sidc.length === 20
    ? Modern.format(options, sidc)
    : Legacy.format(options, sidc)
  return standard ? `${formatted}+${standard}` : formatted
})
