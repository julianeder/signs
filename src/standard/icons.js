import regular from './icons-regular.json'
import special from './icons-special.json'
import * as BBox from '../bbox'

const boxes = Object.entries(regular).reduce((acc, [key, icon]) => {
  acc[key] = icon.length ? BBox.of(icon) : [100, 100, 100, 100]
  return acc
}, {})


const resolve = options => instruction => {
  const { stroke, fill, ...rest } = instruction
  return {
    stroke: options[stroke] || stroke,
    fill: options[fill] || fill,
    ...rest
  }
}

const icon = (key, options) =>
  (regular[key] || []).map(instruction => {
    const { children, ...rest } = instruction
    return children
      ? { children: children.map(resolve(options)), ...rest }
      : { ...resolve(options)(rest) }
  })

export default options => {

  // Preview icons for tactical graphics:
  if (special[options.generic]) {
    return () => [[0, 0, 200, 200], special[options.generic]]
  }

  const key = `${options.generic}+${options.affiliation}`
  return box => {
    return [boxes[key] || box, icon(key, options)]
  }
}
