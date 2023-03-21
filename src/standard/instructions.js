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
import * as Direction from './direction'
import icon from './icons'
import fields from './fields'

export const instructions = (options, meta) => {

  const hints = {
    colorMode: options.colorMode || 'light',

    fillOpacity: 
      options.fillOpacity === 0
        ? 0
        : options.fillOpacity || 1
        ,

    frame: options.frame !== false && !meta.frameless,
    modifiers: options.modifiers || {},
    infoFields: (options.modifiers && options.infoFields) || false,
    engagement: options?.modifiers?.AT,
    direction: Number(options?.modifiers?.Q) || undefined, // suppress/replace NaN
    strokeWidth: options.strokeWidth || 4,
    strokeColor: options.strokeColor || 'black',
    monoColor: options.monoColor,
    outlineWidth: options.outlineWidth || 0,
    outlineColor: options.outlineColor || false,

    // Implicitly true if not explicitly false:
    outline: 
      options.outline === false
        ? false
        : options.outlineWidth > 0 &&  options.outlineColor
        ,
        
    size: options.size || 100, // %
    hqStaffLength: options.hqStaffLength || 100 
  }

  const context = {
    ...meta,
    ...hints,
    ...Styles.styles(meta, hints)
  }

  const padding = 2 + Math.max(
    context['style:default']['stroke-width'],
    context['style:outline']['stroke-width'],
  ) / 2

  const [bbox, children] = Layout.compose(
    (context.frame && context.dimension !== 'CONTROL') && Frame.frame(context),
    (context.frame && (!context.present || context.pending)) && Frame.overlay(context),
    (context.frame && context.outline) && Frame.outline(context),
    icon(context),
    Layout.overlay(
      Layout.compose(
        context.frame && Frame.context(context),
        context.infoFields && fields(context),
      ),
      Layout.compose(
        Layout.overlay(
          context.installation && Installation.installation(context),
          context.condition && Condition.condition(context),
          context.echelon && Echelon.echelon(context),
          context.echelon && context.outline & Echelon.outline(context),
          context.taskForce && Modifiers.taskForce(context),
          context.feintDummy && Modifiers.feintDummy(context),
          context.headquarters && Modifiers.headquartersStaff(context),
          context.direction !== undefined && Direction.direction(context),
          context.mobility && Mobility.mobility(context),
        ),
        context.modifiers.AO && Engagement.engagement(context),
      )
    ),

    // Last but not least, add padding:
    bbox => [BBox.resize([padding, padding], bbox), []]
  )(BBox.NULL)

  const scale = x => x * hints.size / 100
  const extent = BBox.extent(bbox)
  const [width, height] = extent.map(scale)
  const size = { width, height }

  const center = meta.headquarters
    ? { x: bbox[0] + padding, y: bbox[3] - padding }
    : { x: 100, y: 100 }
  
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

  // TODO: move to milsymbol/genicon.js
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
