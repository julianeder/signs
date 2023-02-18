import * as BBox from './bbox'

export const engagement = ({ AO, outline, styles }) => {
  if (!AO) return box => [box, []]

  return box => {
    const extent = BBox.extent(box)
    const w = Math.max(extent[0], AO.length * 16);
    const x = 100 - w / 2
    const y = box[1]

    const d = `M${x},${y - 6} l${w},0 0,-25 ${-w},0 z`

    const instructions = [
      { type: "path", d, ...styles['style:engagement/bar'] },
      { type: "text", text: AO, x: 100, y: y - 11, ...styles['style:engagement/text'] }
    ]

    if (outline) instructions.push({ type: "path", d, ...styles['style:outline'], zIndex: -1 })

    return [BBox.of(instructions[0]), instructions]
  }
}
