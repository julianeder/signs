import * as BBox from '../bbox'
import { DEG2RAD, rotate, translate, matrix } from '../transform'

export const direction = options => {
  return box => {

    const children = [{
      type: "path",
      d: "M0,0 l0,-75 -5,3 5,-15 5,15 -5,-3",
      ...options['style:direction']
    }]

    const [dx, dy] = options.dimension === 'UNIT'
      ? options.headquarters
        ? [box[0], box[3] + 100]
        : [100, box[3] + 100]
      : [100, 100]

    const transform = matrix(
      translate(
        rotate(options.direction * DEG2RAD),
        dx,
        dy
      )
    )

    const instructions = [{
      type: 'g',
      transform,
      children,
      ...options['style:direction']
    }]

    if (options.dimension === 'UNIT' && !options.headquarters) {
      instructions.push({
        type: "path",
        d: `M 100,${box[3]}
        l0,100`,
        ...options['style:direction']
      })
    }

    return [BBox.of(instructions), instructions]
  }
}
