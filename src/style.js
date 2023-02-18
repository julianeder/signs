import * as R from 'ramda'
import * as BBox from './bbox'
import { width as textWidth } from './measure'

const offWhite = 'rgb(239,239,239)'
const colors = {
  'FRAME-FILL+DARK': {
    CIVILIAN: "rgb(80,0,80)",
    FRIEND: "rgb(0,107,140)",
    HOSTILE: "rgb(200,0,0)",
    NEUTRAL: "rgb(0,160,0)",
    UNKNOWN: "rgb(225,220,0)"
  },
  ENGAGEMENT: {
    TARGET: 'rgb(255, 0, 0)',
    'NON-TARGET': 'rgb(255, 255, 255)',
    EXPIRED: 'rgb(255, 120, 0)'
  },
  frameColor: {
    CIVILIAN: "rgb(255,0,255)",
    FRIEND: "rgb(0, 255, 255)",
    HOSTILE: "rgb(255, 0, 0)",
    NEUTRAL: "rgb(0, 255, 0)",
    UNKNOWN: "rgb(255, 255, 0)"
  }
}

export const Style = function (sidc, options) {
  this.sidc = sidc
  this.options = options

  const colorMode = (options.colorMode || 'light').toLowerCase()
  const colorIndex = MODE[colorMode] || 0
  const isCivilian = () => sidc.civilian && sidc.affiliation !== 'HOSTILE'
  const isJoker = () => sidc.joker || sidc.faker

  const key = R.cond([
    [isCivilian, R.always('CIVILIAN')],
    [isJoker, R.always('HOSTILE')],
    [R.T, R.always(this.sidc.affiliation)]
  ])()

  const frameFill = FRAME_FILL[key][colorIndex]

  Object.entries(FRAME_FILL).forEach(([key, value]) => {
    const iconFill = options.frameless ? value[colorIndex] : offWhite
    const colorIcon = options.unfilled ? colors.frameColor[key] : 'black'
    this[`color:icon-fill/${key.toLowerCase()}`] = iconFill
    this[`color:icon/${key.toLowerCase()}`] = colorIcon
    this[`color:icon-white/${key.toLowerCase()}`] = offWhite
    this[`color:icon-black/${key.toLowerCase()}`] = 'black'
  })


  // Numeric APP6 is considered MODERN.
  const legacy = options.type === 'LEGACY' && options.standard === 'APP6'

  this['style:debug'] = {
    stroke: 'red',
    'stroke-width': 2,
    'stroke-dasharray': [10, 10]
  }

  this['style:default'] = {
    'stroke-width': options.strokeWidth,
    stroke: options.strokeColor,
    fill: 'none',
    'font-family': 'Arial',
  }

  this['style:text-amplifiers/left'] = {
    'font-family': 'Arial',
    'font-size': 36,
    'text-anchor': 'end',
    'stroke-width': 0,
    fill: 'black'
  }

  this['style:text-amplifiers/right'] = {
    'font-family': 'Arial',
    'font-size': 36,
    'text-anchor': 'start',
    'stroke-width': 0,
    fill: 'black'
  }

  this['style:text-amplifiers/bottom'] = {}

  this['style:outline'] = {
    'stroke': options.outlineColor,
    'stroke-width': options.strokeWidth + options.outlineWidth * 2,
    'stroke-linejoin': 'round',
    'stroke-linecap': 'round'
   }

  this['style:frame/shape'] = options.unfilled
    ? { 'stroke-width': options.strokeWidth, fill: "none", stroke: colors.frameColor[key] }
    : { 'stroke-width': options.strokeWidth, fill: frameFill }

   this['style:frame/overlay'] = {
    'stroke': offWhite,
    'stroke-width': options.strokeWidth,
    // pending state has precedence over planned status:
    'stroke-dasharray': sidc.pending ? '4,4' : sidc.status === 'PLANNED' ? '8,12' : 'none'
   }

   this['style:frame/decoration'] = {
    fill: options.strokeColor,
    stroke: 'none'
   }

   this['style:echelon'] = {
    'stroke': options.strokeColor,
    'stroke-width': options.strokeWidth,
    'fill': options.strokeColor
   }

   this['style:installation'] = this['style:echelon']

   this['style:engagement/text'] = {
    'text-anchor': "middle",
    'font-size': 22,
    'font-weight': "bold",
    'stroke-width': 4,
    stroke: 'none',
    fill: 'black'
   }

   this['style:engagement/bar'] = {
    fill: colors.ENGAGEMENT[options.AT] || frameFill
   }

   this['style:frame/context'] = {
    'font-family': 'Arial',
    'font-size': 35,
    'font-weight': 'bold',
    'text-anchor': 'start',
    'stroke-width': 0,
    fill: 'black'
  }

  this['style:icon/civilian-fill'] = legacy
    ? { stroke: 'black', 'stroke-width': 3, fill: frameFill }
    : { stroke: 'black', 'stroke-width': 3, fill: offWhite }
}

Style.of = (sidc, options) => new Style(sidc, options)


Style.prototype.strokeWidth = function (styleId) {
  if (!this[styleId]) return 0
  return this[styleId]['stroke-width'] || 0
}

Style.prototype.textExtent = function (lines, styleId) {
  const style = this[styleId]
  const fontSize = style['font-size'] || 40
  const factor = fontSize / 30
  const widths = lines.map(line => textWidth(line) * factor)
  return [Math.max(...widths), lines.length * fontSize]
}

Style.prototype.rect = function (bbox, styleId) {
  const style = this[styleId] || {}
  return { type: 'rect', ...BBox.xywh(bbox), ...style }
}

Style.prototype.style = function (node, styleId) {
  const style = this[styleId] || {}
  return { ...style, ...node }
}

Style.prototype.path = function (d, styleId) {
  const style = this[styleId] || {}
  return { type: 'path', ...style, d }
}

const MODE = { dark: 0, medium: 1, light: 2 }

const FRAME_FILL = {
  CIVILIAN: ['rgb(80,0,80)', 'rgb(128,0,128)', 'rgb(255,161,255)'],
  UNKNOWN: ['rgb(225,220,0)', 'rgb(255,255,0)', 'rgb(255,255,128)'],
  FRIEND: ['rgb(0,107,140)', 'rgb(0,168,220)', 'rgb(128,224,255)'],
  NEUTRAL: ['rgb(0,160,0)', 'rgb(0,226,110)', 'rgb(170,255,170)'],
  HOSTILE: ['rgb(200,0,0)', 'rgb(255,48,49)', 'rgb(255,128,128)']
}
