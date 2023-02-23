import * as BBox from '../bbox'

export const engagement = options => {
  return box => {
    const extent = BBox.extent(box)
    const w = Math.max(extent[0], options.modifiers.AO.length * 16);
    const x = 100 - w / 2
    const y = box[1]

    const d = `M${x},${y - 6} l${w},0 0,-25 ${-w},0 z`

    const instructions = [
      { type: "path", d, ...options['style:engagement/bar'] },
      { type: "text", text: options.modifiers.AO, x: 100, y: y - 11, ...options['style:engagement/text'] }
    ]

    if (options.outline) instructions.push({ type: "path", d, ...options['style:outline'] })
    return [BBox.of(instructions[0]), instructions]
  }
}
