import * as BBox from '../bbox'
import fields from './fields.json'

const fromFields = (fields, options) => box => {
  const stuff = Object.entries(options.modifiers).reduce((acc, [key, value]) => {
    if (!fields[key]) return acc
    if (Array.isArray(fields[key])) {
      fields[key].forEach(field => acc.push({ ...field, text: value }))
    } else acc.push({ ...fields[key], text: value })
    return acc
  }, [])

  return stuff.reduce(([box, instructions], instruction) => {
    instructions.push(instruction)
    const bbox = BBox.of(instruction)
    return [BBox.merge(box, bbox), instructions]
  },[box, []])
}

/* eslint-disable import/no-anonymous-default-export */
export default options => {
  if (!options.infoFields) return box => [box, []]
  if (!fields[options.generic]) return box => [box, []]

  return fromFields(fields[options.generic], options)
}
