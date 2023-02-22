export const styles = function (hints) {
  const styles = {}

  styles['style:default'] = {
    'stroke-width': hints.strokeWidth,
    fill: 'none',
    'font-family': 'Arial',
  }

  styles['style:outline'] = {
    'stroke': hints.outlineColor,
    'stroke-width': hints.strokeWidth + hints.outlineWidth * 2,
    'stroke-linejoin': 'round',
    'stroke-linecap': 'round'
   }

  return styles
}
