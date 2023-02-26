import * as BBox from '../bbox'
import * as Layout from '../layout'
import * as Styles from './styles'
import * as Frame from './frame'
import * as Installation from './installation'
import * as Echelon from './echelon'
import * as Engagement from './engagement'
import * as Mobility from './mobility'
import * as Modifiers from './modifiers'
import * as Condition from './condition'
import icon from './icons'
import fields from './fields'

export const instructions = (options, meta) => {

  const hints = {}
  hints.frame = options.frame !== false && !meta.frameless
  hints.modifiers = options.modifiers
  hints.infoFields = (options.modifiers && options.infoFields) || false
  hints.engagement = options?.modifiers?.AT
  hints.strokeWidth = options.strokeWidth || 4
  hints.strokeColor = options.strokeColor || 'black'
  hints.outlineWidth = options.outlineWidth || 0
  hints.outlineColor = options.outlineColor || false
  hints.outline = (options.outline === false || options.outlineWidth === 0 || !options.outlineColor)
    ? false
    : true

  const context = {
    ...meta,
    ...hints,
    ...Styles.styles(meta, hints)
  }

  const padding = 2 + Math.max(
    context['style:default']['stroke-width'],
    context['style:outline']['stroke-width'],
  ) / 2

  const echelon = []
  const modifiers = []
  const symbol = []

  if (context.echelon) echelon.push(Echelon.echelon(context))
  if (context.echelon && context.outline) echelon.push(Echelon.outline(context))
  if (context.mobility) modifiers.push(Mobility.mobility(context))
  if (context.taskForce) modifiers.push(Modifiers.taskForce(context))
  if (context.feintDummy) modifiers.push(Modifiers.feintDummy(context))
  if (context.headquarters) modifiers.push(Modifiers.headquartersStaff(context))
  if (context.infoFields) modifiers.push(fields(context))
  if (context.frame && context.dimension !== 'CONTROL') symbol.push(Frame.frame(context))
  if (context.frame && (!context.present || context.pending)) symbol.push(Frame.overlay(context))
  if (context.frame && context.outline) symbol.push(Frame.outline(context))
  if (context.condition) symbol.push(Condition.condition(context))

  symbol.push(icon(context))
  if (context.installation) symbol.push(Installation.installation(context))
  if (echelon.length) symbol.push(Layout.overlay(...echelon))
  if (context.modifiers.AO) symbol.push(Engagement.engagement(context))
  if (context.frame) symbol.push(Frame.context(context))
  if (modifiers.length) symbol.push(Layout.overlay(...modifiers))
  symbol.push(bbox => [BBox.resize([padding, padding], bbox), []])

  const [bbox, children] = Layout.compose(symbol)
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
