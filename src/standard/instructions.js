import * as BBox from '../bbox'
import * as Layout from '../layout'
import * as Styles from './styles'
import * as Frame from './frame'
import * as Installation from './installation'
import * as Echelon from './echelon'
import * as Engagement from './engagement'
import * as Mobility from './mobility'
import * as Modifiers from './modifiers'
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

  const [bbox, children] = Layout.compose([
    Frame.frame(context),
    Frame.overlay(context),
    Frame.outline(context),
    icon(context),
    Installation.installation(context),
    Layout.overlay(
      Echelon.outline(context),
      Echelon.echelon(context)
    ),
    Engagement.engagement(context),
    Frame.context(context),
    Layout.overlay(
      Mobility.mobility(context),
      Modifiers.taskForce(context),
      Modifiers.feintDummy(context),
      Modifiers.headquartersStaff(context),
      fields(context)
    ),

    // bbox => [bbox, styles.rect(bbox, 'style:debug')],
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
