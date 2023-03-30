import regular from './icon-data.json'
import index from './icon-index.json'
import special from './icons-special.json'
import skkm from './icons-skkm.json'
import * as BBox from '../bbox'

const boxes = Object.entries(({ ...regular, ...skkm })).reduce((acc, [key, icon]) => {
  acc[key] = icon.length ? BBox.of(icon) : [100, 100, 100, 100]
  return acc
}, {})


const lookupInstructions = options => () => {
  if (special[options.generic]) return special[options.generic]
  else if (skkm[options.generic]) return skkm[options.generic]
  else {
    const key = `${options.generic}+${options.standard}+${options.affiliation}`
    const hashcode = index[key]
    return regular[hashcode] || []
  }
}

const lookupBBox = options => box => {
  if (special[options.generic]) return [0, 0, 200, 200]
  else if (skkm[options.generic]) return boxes[options.generic]
  else {
    const key = `${options.generic}+${options.standard}+${options.affiliation}`
    const hashcode = index[key]
    return boxes[hashcode] || box
  }
}

const resolveStyles = options => instructions => {
  if (Array.isArray(instructions)) return instructions.map(resolveStyles(options))
  else {
    const { stroke, fill, children, ...rest } = instructions
    return children
      ? { ...rest, children: children.map(resolveStyles(options)) }
      : {
        stroke: options[stroke] || stroke,
        fill: options[fill] || fill,
        ...rest
      }
  }
}

export default options => {
  const instruction = lookupInstructions(options)
  const bbox = lookupBBox(options)
  const styles = resolveStyles(options)
  return box => [bbox(box), styles(instruction())]
}
