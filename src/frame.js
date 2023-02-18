import * as R from 'ramda'
import * as BBox from './bbox'
import { NOOP } from './common'
import FRAME from './frame.json'
import DECORATIONS from './decorations.json'

FRAME['SPACE+UNKNOWN'] = FRAME['AIR+UNKNOWN']
FRAME['SPACE+FRIEND'] = FRAME['AIR+FRIEND']
FRAME['SPACE+NEUTRAL'] = FRAME['AIR+NEUTRAL']
FRAME['SPACE+HOSTILE'] = FRAME['AIR+HOSTILE']
FRAME['ACTIVITY+UNKNOWN'] = FRAME['UNIT+UNKNOWN']
FRAME['ACTIVITY+FRIEND'] = FRAME['UNIT+FRIEND']
FRAME['ACTIVITY+NEUTRAL'] = FRAME['UNIT+NEUTRAL']
FRAME['ACTIVITY+HOSTILE'] = FRAME['UNIT+HOSTILE']

const frames = Object.entries(FRAME).reduce((acc, [key, frame]) => {
  const { open, ...graphics } = frame
  acc[key] = acc[key] || {}
  acc[key].open = graphics
  acc[key].closed = { ...graphics, d: graphics.d + ' z' }
  acc[key].bbox = BBox.of(graphics)
  return acc
}, {})

const instruction =
  (type, style, zIndex = 0) =>
    ({ dimension, affiliation, styles }) => {
      const key = `${dimension}+${affiliation}`
      const frame = frames[key]
      const instructions = [{ ...frame[type], ...styles[style], zIndex }]
      const decoration = DECORATIONS[key]
      if (decoration) instructions.push({ ...decoration, ...styles['style:frame/decoration'], zIndex})
      return () => [frame.bbox, instructions]
    }

export const outline = R.ifElse(
  ({ frame, outline }) => frame && outline,
  instruction('closed', 'style:outline', -1),
  NOOP
)

export const frame = R.ifElse(
  ({ frame, dimension }) => frame && dimension !== 'CONTROL',
  instruction('open', 'style:frame/shape', 0),
  NOOP
)

export const overlay = R.ifElse(
  ({ frame, status, pending }) => frame && (status !== 'PRESENT' || pending),
  instruction('open', 'style:frame/overlay', 1),
  NOOP
)

export const context = ({ dimension, affiliation, outline, styles, ...rest }) => {
  const text = R.cond([
    [R.propEq('joker', true), R.always('J')],
    [R.propEq('faker', true), R.always('K')],
    [R.propEq('context', 'EXERCISE'), R.always('X')],
    [R.propEq('context', 'SIMULATION'), R.always('S')],
    [R.T, R.always(undefined)]
  ])(rest)

  if (!text) return box => [box, []]

  const key = `${dimension}:${affiliation}`
  const spacing = key.match(/(UNKNOWN$)|(SUBSURFACE:HOSTILE)/) ? -10 : 10

  return box => {
    const instructions = []
    const instruction = { type: 'text', text, x: box[2] + spacing, y: 60, ...styles['style:frame/context'] }
    const bbox = [box[0], 60 - 25, box[2] + spacing + 22, box[3]]
    instructions.push(instruction)
    if (outline) instructions.push({ ...instruction, ...styles['style:outline'], zIndex: -1 })
    return [bbox, instructions]
  }
}