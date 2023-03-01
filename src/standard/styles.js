import * as R from 'ramda'

export const styles = function (meta, hints) {
  const colorMode = (hints.colorMode || 'light').toLowerCase()
  const colorIndex = MODE[colorMode] || 0
  const isCivilian = () => meta.civilian && meta.affiliation !== 'HOSTILE'
  const isJoker = () => meta.joker || meta.faker

  const styles = {}

  const key = R.cond([
    [isCivilian, R.always('CIVILIAN')],
    [isJoker, R.always('HOSTILE')],
    [R.T, R.always(meta.affiliation)]
  ])()

  const frameFill = FRAME_FILL[key][colorIndex]

  Object.entries(FRAME_FILL).forEach(([key, value]) => {
    const iconFill = meta.frameless ? value[colorIndex] : OFF_WHITE
    const colorIcon = meta.unfilled ? COLORS.frameColor[key] : 'black'
    styles[`color:icon-fill/${key.toLowerCase()}`] = iconFill
    styles[`color:fill/${key.toLowerCase()}`] = FRAME_FILL[key][colorIndex]
    styles[`color:icon/${key.toLowerCase()}`] = colorIcon
    styles[`color:icon-white/${key.toLowerCase()}`] = OFF_WHITE
    styles[`color:icon-black/${key.toLowerCase()}`] = 'black'
  })

  // Numeric APP6 is considered MODERN.
  const legacy = meta.type === 'LEGACY' && meta.standard === 'APP6'

  styles['style:debug'] = {
    stroke: 'red',
    'stroke-width': 2,
    'stroke-dasharray': [10, 10]
  }

  styles['style:default'] = {
    'stroke-width': hints.strokeWidth,
    stroke: hints.strokeColor,
    fill: 'none',
    'font-family': 'Arial',
  }

  styles['style:text-amplifiers/left'] = {
    'font-family': 'Arial',
    'font-size': 36,
    'text-anchor': 'end',
    'stroke-width': 0,
    fill: 'black'
  }

  styles['style:text-amplifiers/right'] = {
    'font-family': 'Arial',
    'font-size': 36,
    'text-anchor': 'start',
    'stroke-width': 0,
    fill: 'black'
  }

  styles['style:text-amplifiers/bottom'] = {}

  styles['style:outline'] = {
    stroke: hints.outlineColor,
    'stroke-width': hints.strokeWidth + hints.outlineWidth * 2,
    'stroke-linejoin': 'round',
    'stroke-linecap': 'round',
    zIndex: -1
   }

  styles['style:frame/shape'] = meta.unfilled
    ? { 'stroke-width': hints.strokeWidth, fill: 'none', stroke: COLORS.frameColor[key] }
    : { 'stroke-width': hints.strokeWidth, fill: frameFill }

   styles['style:frame/overlay'] = {
    stroke: OFF_WHITE,
    'stroke-width': hints.strokeWidth,
    // pending state has precedence over planned status:
    'stroke-dasharray':
      meta.pending
        ? '4,4'
        : meta.planned
          ? '8,12'
          : 'none',
    zIndex: 1
   }

   styles['style:frame/decoration'] = {
    fill: hints.strokeColor,
    stroke: 'none'
   }

   styles['style:echelon'] = {
    stroke: hints.strokeColor,
    'stroke-width': hints.strokeWidth,
    fill: hints.strokeColor
   }

   styles['style:installation'] = styles['style:echelon']

   styles['style:engagement/text'] = {
    'text-anchor': 'middle',
    'font-size': 22,
    'font-weight': 'bold',
    'stroke-width': 4,
    stroke: 'none',
    fill: 'black'
   }

   styles['style:engagement/bar'] = {
    fill: COLORS.ENGAGEMENT[hints.engagement] || frameFill
   }

   styles['style:frame/context'] = {
    'font-family': 'Arial',
    'font-size': 35,
    'font-weight': 'bold',
    'text-anchor': 'start',
    'stroke-width': 0,
    fill: 'black'
  }

  styles['style:icon/civilian-fill'] = legacy
    ? { stroke: 'black', 'stroke-width': 3, fill: frameFill }
    : { stroke: 'black', 'stroke-width': 3, fill: OFF_WHITE }

  styles['style:condition'] = {
    fill: COLORS.condition[meta.condition] || 'none',
    stroke: hints.strokeColor,
    'stroke-width': hints.strokeWidth,
  }

  styles['style:direction'] = {
    stroke: hints.strokeColor,
    'stroke-width': hints.strokeWidth,
    fill: hints.strokeColor,
    zIndex: 1
  }

  return styles
}

const MODE = { dark: 0, medium: 1, light: 2 }

const OFF_WHITE = 'rgb(239,239,239)'

const COLORS = {
  'FRAME-FILL+DARK': {
    CIVILIAN: 'rgb(80,0,80)',
    FRIEND: 'rgb(0,107,140)',
    HOSTILE: 'rgb(200,0,0)',
    NEUTRAL: 'rgb(0,160,0)',
    UNKNOWN: 'rgb(225,220,0)'
  },
  ENGAGEMENT: {
    TARGET: 'rgb(255, 0, 0)',
    'NON-TARGET': 'rgb(255, 255, 255)',
    EXPIRED: 'rgb(255, 120, 0)'
  },
  frameColor: {
    CIVILIAN: 'rgb(255,0,255)',
    FRIEND: 'rgb(0, 255, 255)',
    HOSTILE: 'rgb(255, 0, 0)',
    NEUTRAL: 'rgb(0, 255, 0)',
    UNKNOWN: 'rgb(255, 255, 0)'
  },
  condition: {
    FULLY_CAPABLE: 'rgb(0,255,0)',
    DAMAGED: 'rgb(255,255,0)',
    DESTROYED: 'rgb(255,0,0)',
    FULL_TO_CAPACITY: 'rgb(0, 180, 240)'
  }
}

const FRAME_FILL = {
  CIVILIAN: ['rgb(80,0,80)', 'rgb(128,0,128)', 'rgb(255,161,255)'],
  UNKNOWN: ['rgb(225,220,0)', 'rgb(255,255,0)', 'rgb(255,255,128)'],
  FRIEND: ['rgb(0,107,140)', 'rgb(0,168,220)', 'rgb(128,224,255)'],
  NEUTRAL: ['rgb(0,160,0)', 'rgb(0,226,110)', 'rgb(170,255,170)'],
  HOSTILE: ['rgb(200,0,0)', 'rgb(255,48,49)', 'rgb(255,128,128)']
}
