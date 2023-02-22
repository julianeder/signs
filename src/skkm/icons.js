import icons from './icons.json'

const resolve = options => instruction => {
  const { stroke, fill, ...rest } = instruction
  return {
    stroke: options[stroke] || stroke,
    fill: options[fill] || fill,
    ...rest
  }
}

const icon = (key, options) =>
  (icons[key] || []).map(instruction => {
    const { children, ...rest } = instruction
    return children
      ? { children: children.map(resolve(options)), ...rest }
      : { ...resolve(options)(rest) }
  })

export default options => {
  return () => {
    return [[0, 0, 200, 200], icon(options.generic, options)]
  }
}
