import icons from './icons.json'
import previews from './previews.json'
import * as BBox from './bbox'

const boxes = Object.entries(icons).reduce((acc, [key, icon]) => {
  acc[key] = icon.length ? BBox.of(icon) : [100, 100, 100, 100]
  return acc
}, {})


const resolve = styles => instruction => {
  const { stroke, fill, ...rest } = instruction
  return {
    stroke: styles[stroke] || stroke,
    fill: styles[fill] || fill,
    ...rest
  }
}

const icon = (key, styles) =>
  (icons[key] || []).map(instruction => {
    const { children, ...rest } = instruction
    return children
      ? { children: children.map(resolve(styles)), ...rest }
      : { ...resolve(styles)(rest) }
  })

export default ({ generic, affiliation, styles }) => {

  // Check tactical graphocs previews first:
  if (previews[generic]) {
    return () => [[0, 0, 200, 200], previews[generic]]
  }

  const key = `${generic}+${affiliation}`
  return box => {
    return [boxes[key] || box, icon(key, styles)]
  }
}
