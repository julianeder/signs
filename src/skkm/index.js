import { instructions } from './instructions'

const accept = options => {
  const [code] = options.sidc.split('+')
  const normalized = code.toUpperCase().replaceAll('*', '-')
  const regex = /[A-Z\-]{10,15}/
  const match = normalized.match(regex)
  return match ? true : false
}

const document = options => {
  return instructions(options, meta(options))
}

const meta = options => {
  const meta = {}
  const [sidc] = options.sidc.split('+')

  meta.type = 'LEGACY'
  meta.sidc = sidc.toUpperCase().replaceAll('*', '-')
  meta.standard = 'SKKM'
  meta.generic = sidc[0] + '-' + sidc[2] + '-' + (sidc.substring(4, 10) || '------')

  return meta
}

export const skkm = {
  accept,
  document
}