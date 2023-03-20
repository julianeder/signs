import * as BBox from '../bbox'
import * as Layout from '../layout'
import * as Styles from './styles'
import icon from './icons'
import fields from './fields'

export const instructions = (options, meta) => {

  const hints = {}
  hints.modifiers = options.modifiers
  hints.infoFields = (options.modifiers && options.infoFields) || false
  hints.strokeWidth = options.strokeWidth || 4
  hints.strokeColor = options.strokeColor || 'black'
  hints.outlineWidth = options.outlineWidth || 0
  hints.outlineColor = options.outlineColor || false
  hints.size = options.size || 100
  hints.outline = (options.outline === false || options.outlineWidth === 0 || !options.outlineColor)
    ? false
    : true

  const context = {
    ...hints,
    ...meta,
    ...Styles.styles(hints)
  }

  const padding = 2 + Math.max(
    context['style:default']['stroke-width'],
    context['style:outline']['stroke-width'],
  ) / 2

  const [bbox, children] = Layout.compose(
    icon(context),
    fields(context),
    // Adjust bbox according stroke/outline width:
    bbox => [BBox.resize([padding, padding], bbox), []]
  )(BBox.NULL)

  const scale = x => x * hints.size / 100
  const extent = BBox.extent(bbox)
  const [width, height] = extent.map(scale)
  const size = { width, height }
  const center = { x: 100, y: 100 }
  
  const anchor = { 
    x: (center.x - bbox[0]) * hints.size / 100, 
    y: (center.y - bbox[1]) * hints.size / 100
  }

  // Poor man's (SVG) layers:
  children.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))

  const document = {
    type: 'svg',
    xmlns: 'http://www.w3.org/2000/svg',
    version: '1.2',
    baseProfile: 'tiny',
    width,
    height,
    viewBox: [bbox[0], bbox[1], ...extent],
    children,
    ...context['style:default']
  }

  const array = x => x ? Array.isArray(x) ? x : [x] : []
  const escape = s => s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")


  const xml = document => {
    const { type, children, zIndex, ...properties } = document
    const propertyList = Object.entries(properties).map(([key, value]) => {
      if (key === 'text') return ''
      const type = typeof value
      if (type === 'string') return `${key}="${value}"`
      else if (type === 'number') return `${key}="${value}"`
      else if (Array.isArray(value)) return `${key}="${value.join(' ')}"`
      else return ''
    }).join(' ')

    const childList = type !== 'text'
      ? (array(children)).map(child => xml(child)).join('')
      : escape(properties.text)

    return `<${type} ${propertyList}>${childList}</${type}>`
  }

  const svg = xml(document)

  return {
    getSize: () => size,
    getAnchor: () => anchor,
    asSVG: () => svg, 
    toDataURL: () => 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
  }
}
