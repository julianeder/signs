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

  const [bbox, children] = Layout.compose([
    icon(context),
    fields(context),
    // Adjust bbox according stroke/outline width:
    bbox => [BBox.resize([padding, padding], bbox), []]
  ])

  const [width, height] = BBox.extent(bbox)
  const viewBox = [bbox[0], bbox[1], width, height]
  const size = { width, height }

  // Poor man's (SVG) layers:
  children.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))

  const document = {
    type: 'svg',
    xmlns: 'http://www.w3.org/2000/svg',
    version: '1.2',
    baseProfile: 'tiny',
    width,
    height,
    viewBox,
    children,
    ...context['style:default']
  }

  const array = x => x ? Array.isArray(x) ? x : [x] : []
  const escape = s => s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/#/g, "%23")


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

  return [size, xml(document)]
}
