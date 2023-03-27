import regular from './icon-data.json'
import index from './icon-index.json'
import special from './icons-special.json'
import skkm from './icons-skkm.json'
import * as BBox from '../bbox'

const boxes = Object.entries(({ ...regular, ...skkm })).reduce((acc, [key, icon]) => {
  acc[key] = icon.length ? BBox.of(icon) : [100, 100, 100, 100]
  return acc
}, {})


const resolve = options => instruction => {
  const { stroke, fill, children, ...rest } = instruction
  return children
    ? { ...rest, children: children.map(resolve(options)) }
    : {
      stroke: options[stroke] || stroke,
      fill: options[fill] || fill,
      ...rest
    }
}

const icon = (hashcode, options) => {
  const instructions = regular[hashcode] || []
  return instructions.map(instruction => {
    const { children, ...rest } = instruction
    return children
      ? { children: children.map(resolve(options)), ...rest }
      : { ...resolve(options)(rest) }
  })
}

export default options => {

  // Preview icons for tactical graphics:
  if (special[options.generic]) {
    return () => [[0, 0, 200, 200], special[options.generic]]
  } else if (skkm[options.generic]) {
    return () => [boxes[options.generic], skkm[options.generic]]
  }

  const key = `${options.generic}+${options.standard}+${options.affiliation}`
  const hashcode = index[key]

  return box => {
    return [boxes[hashcode] || box, icon(hashcode, options)]
  }
}
