import * as BBox from './bbox'
import templates from './templates.json'
import fields from './fields.json'

const fromTemplate = (template, modifiers, styles, outline) => box => {
  const gap = 16
  const [width, height] = BBox.extent(box)

  const boxes = {
    left: extent => {
      const right = box[0] - gap
      const left = right - extent[0]
      const top = box[1] + (height - extent[1]) / 2
      const bottom = top + extent[1]
      return [left, top, right, bottom]
    },
    right: extent => {
      const right = box[2] + gap
      const left = right + extent[0]
      const top = box[1] + (height - extent[1]) / 2
      const bottom = top + extent[1]
      return [right, top, left, bottom]
    }
  }

  const makeText = (x, y, text) => ({
    type: 'text', x, y, text,
    'dominant-baseline': 'hanging'
  })

  const makeGroup = (box, children, style, zIndex) => ({
    type: 'g',
    children,
    transform: `translate(${box[0]},${box[1]})`,
    ...style,
    zIndex
  })

  const line = slots => slots.map(key => modifiers[key]).filter(Boolean).join('/')
  const [bbox, instructions] = Object
    .entries(template)
    .reduce((acc, [placement, slots]) => {
      const lines = slots.map(line)

      // No lines -> nothing to do.
      if (lines.filter(Boolean).length === 0) return acc

      const style = `style:text-amplifiers/${placement}`
      const extent = styles.textExtent(lines, style)
      const box = boxes[placement](extent)
      const x = placement === 'right' ? 0 : extent[0]
      const dy = extent[1] / lines.length
      const text = (line, index) => makeText(x, index * dy, line)
      const children = lines.map(text)
      acc[1].push(makeGroup(box, children, styles[style], 0 ))
      if (outline) acc[1].push(makeGroup(box, children, { ...styles[style], ...styles['style:outline'] }, -1))
      return [BBox.merge(acc[0], box), acc[1]]
    }, [BBox.NULL, []])

  return [bbox, instructions]
}

const fromFields = (fields, modifiers, styles, outline) => box => {
  const stuff = Object.entries(modifiers).reduce((acc, [key, value]) => {
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
export default ({ type, dimension, infoFields, styles, outline, generic, ...modifiers }) => {
  if (!infoFields) return box => [box, []]
  if (!modifiers) return box => [box, []]

  if (fields[generic]) return fromFields(fields[generic], modifiers, styles, outline)
  const template = templates[`${type}+${dimension}`]
  if (!template) return box => [box, []]

  return fromTemplate(template, modifiers, styles, outline)
}
