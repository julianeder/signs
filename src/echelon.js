import * as R from 'ramda'
import * as BBox from './bbox'
import ECHELON from './echelon.json'

const echelons = Object.entries(ECHELON)
  .reduce((acc, [key, children]) => {
    acc[key] = [BBox.of(children), children]
    return acc
  }, {})

const instruction =
  (style, zIndex) =>
    ({ echelon, styles }) =>
      box => {
        const [bbox, children] = echelons[echelon]
        const translation = BBox.translate([0, box[1]], bbox)
        const transform = `translate(0, ${box[1]})`
        const group = { type: 'g', children, ...styles[style], transform, zIndex }
        return [translation, group]
      }

// TODO: combine outline/echelon

export const outline = R.ifElse(
  ({ echelon }) => echelon,
  instruction('style:outline', -1),
  () => box => [box, []]
)

export const echelon = R.ifElse(
  ({ echelon }) => echelon,
  instruction('style:echelon'),
  () => box => [box, []]
)
