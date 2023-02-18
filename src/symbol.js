import * as Frame from './frame'
import * as Echelon from './echelon'
import * as Installation from './installation'
import * as Mobility from './mobility'
import * as Modifiers from './modifiers'
import * as Engagement from './engagement'
import { Style } from './style'
import * as BBox from './bbox'
import icon from './icons'
import fields from './fields'
import { SIDC } from './sidc'
import * as Layout from './layout'

export const Symbol = function (options) {
  const sidc = SIDC.of(options.sidc)

  // Normalize options:
  const effectiveOptions = { ...options, ...sidc }
  effectiveOptions.frame = (options.frame === true && !sidc.frameless) || false
  effectiveOptions.strokeWidth = options.strokeWidth || 4
  effectiveOptions.strokeColor = options.strokeColor || 'black'
  effectiveOptions.outlineWidth = options.outlineWidth || 0
  effectiveOptions.outlineColor = options.outlineColor || false
  effectiveOptions.outline = (options.outline === false || effectiveOptions.outlineWidth === 0 || !effectiveOptions.outlineColor)
    ? false
    : true


  const styles = Style.of(sidc, effectiveOptions)
  const context = {
    ...options,
    ...effectiveOptions,
    styles,
    ...sidc
  }

  const padding = 2 + Math.max(
    styles.strokeWidth('style:default'),
    styles.strokeWidth('style:outline')
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
  this.size = { width, height }

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
    ...styles['style:default']
  }

  const array = x => x ? Array.isArray(x) ? x : [x] : []
  const escape = s => s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/#/g, "%23")


  const xml = document => {
    const { type, children, zIndex, style, ...properties } = document
    const props = { ...properties, ...(styles[style] || {}) }
    const propertyList = Object.entries(props).map(([key, value]) => {
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

  this.svg = xml(document)
}

Symbol.of = (options) => new Symbol(options)

Symbol.prototype.getSize = function () {
  return this.size
}

Symbol.prototype.asSVG = function () {
  return this.svg
}
