import * as R from 'ramda'
import * as BBox from './bbox'

export const overlay = (...parts) => box => {
  const overlays = parts.map(part => part(box)).filter(Boolean)
  const bbox = overlays.map(R.prop(0)).reduce(BBox.merge, box)
  const instructions = overlays.map(R.prop(1)).flat()
  return [bbox, instructions]
}

export const compose = fns =>
  fns.reduce(([box, acc], fn) => R.ifElse(
    Boolean,
    ([bbox, instruction]) => [BBox.merge(box, bbox), acc.concat(instruction)],
    () => [box, acc]
  )(fn(box)),
  [BBox.NULL, []]
)
