import * as BBox from './bbox'

export const installation = ({ installation, affiliation, outline, styles }) => {
  if (!installation) return bbox => [bbox, []]

  const heights = strokeWidth => ({
    UNKNOWN: { y1: 2 - strokeWidth / 2, y2: -strokeWidth },
    FRIEND: { y1: -strokeWidth / 2, y2: -strokeWidth },
    NEUTRAL: { y1: -strokeWidth / 2, y2: -strokeWidth },
    HOSTILE: { y1: 14 - strokeWidth / 2, y2: -strokeWidth },
  })

  const strokeWidth = styles.strokeWidth('style:installation')
  const { y1, y2 } = heights(strokeWidth)[affiliation]
  const d = `M85,${y1} 85,-12 115,-12 115,${y1} 100,${y2} Z`
  const path = { type: 'path', d }

  return box => {
    const dy = box[1] + strokeWidth / 2
    const transform = `translate(0, ${dy})`
    const group = { type: 'g', children: [path], transform }
    const children = [{ ...group, ...styles['style:installation'] }]
    if (outline) children.push({ ...group, ...styles['style:outline'], zIndex: -1 })
    const bbox = BBox.of(children)
    const translated = BBox.translate([0, dy], bbox)
    return [translated, children]
  }
}
