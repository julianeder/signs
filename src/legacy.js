const SIDC = function (sidc, standard = '2525') {
  this.type = 'LEGACY'
  this.sidc = sidc.replaceAll('*', '-')
  this.standard = standard
  this.generic = this.sidc[0] + '-' + this.sidc[2] + '-' + (this.sidc.substring(4, 10) || '------')

  const parts = {
    scheme: this.sidc[0],
    identity: this.sidc[1],
    dimension: this.sidc[2],
    status: this.sidc[3],
    function: this.sidc.substring(4, 10),
    modifier10: this.sidc[10],
    modifier11: this.sidc[11],
    modifiers: this.sidc.substring(10, 12)
  }

  this.affiliation = AFFILIATION[parts.identity]
  this.joker = parts.identity === 'J'
  this.faker = parts.identity === 'K'
  this.context = EXERCISE.includes(parts.identity) ? 'EXERCISE' : 'REALITY'
  this.status = Object.entries(STATUS).find(([_, code]) => code === parts.status)[0]
  this.dimension = DIMENSION.find(([regex]) => this.sidc.match(regex))[1]
  this.frameless = FRAMELESS.some(regex => this.sidc.match(regex))
  this.unfilled = UNFILLED.some(regex => this.sidc.match(regex))
  this.civilian = CIVILIAN.some(regex => this.sidc.match(regex))
  this.pending = PENDING.includes(parts.identity)
  this.installation = this.dimension === 'UNIT' && parts.modifiers === 'H-'
  this.taskForce = TASK_FORCE.includes(parts.modifier10)
  this.headquarters = HEADQUARTERS.includes(parts.modifier10)
  this.feintDummy = FEINT_DUMMY.includes(parts.modifier10)

  // Mobility and echelon are mutually exclusive; try mobility first.
  // TODO: limit to equipment

  this.mobility = (() => {
    // TODO: direct lookup, reverse MOBILITY key/value
    const lookup = ([_, code]) => code === parts.modifiers
    const mobility = Object.entries(MOBILITY).find(lookup)
    return mobility ? mobility[0] : false
  })()

  this.echelon = !this.mobility && (() => {
    // TODO: direct lookup, reverse ECHELON key/value
    const lookup = ([_, code]) => code === parts.modifier11
    const echelon = Object.entries(ECHELON).find(lookup)
    return echelon ? echelon[0] : false
  })()
}

export default SIDC

// TODO: use Set()
const PENDING = ['P', 'A', 'S', 'G', 'M']
const EXERCISE = ['D', 'G', 'J', 'K', 'L', 'M', 'W']

const AFFILIATION = {
  H: 'HOSTILE', J: 'FRIEND', K: 'FRIEND', S: 'HOSTILE',
  A: 'FRIEND', F: 'FRIEND', D: 'FRIEND', M: 'FRIEND',
  L: 'NEUTRAL', N: 'NEUTRAL',
  G: 'UNKNOWN', P: 'UNKNOWN', U: 'UNKNOWN', W: 'UNKNOWN'
}

const DIMENSION = [
  [/^[^O].P/, 'SPACE'],
  [/^[^O].[AP]/, 'AIR'],
  [/^O.[VOR]/, 'ACTIVITY'], // precedence over SO
  [/^O/, 'UNIT'], // SO => GROUND/UNIT
  [/^S.G.E/, 'EQUIPMENT'],
  [/^.FS/, 'EQUIPMENT'],
  [/^I.G/, 'EQUIPMENT'], // SIGINT
  [/^E.O.(AB|AE|AF|BB|CB|CC|DB|D.B|E.)/, 'EQUIPMENT'], // EMS EQUIPMENT
  [/^E.F.(BA|MA|MC)/, 'EQUIPMENT'],
  [/^E/, 'UNIT'], // EMS tactical symbols
  [/^..[EFGOSXZ]/, 'UNIT'], // incl. SOF, EMS
  [/^..U/, 'SUBSURFACE' ],
  [/^G/, 'CONTROL'] // control measures aka tactical graphics
]

const FRAMELESS = [
  /^..S.(O-----|ED----|EP----|EV----|ZM----|ZN----|ZI----)/,
  /^E.N.(AA----|AB----|AC----|AD----|AE----|AG----|BB----|BC----|BF----|BM----|CA----|CB----|CC----|CD----|CE----)/,
  /^W.S.(WSVE--|WSD-LI|WSFGSO|WSGRL-|WSR-LI|WSDSLM|WSS-LI|WSTMH-|WST-FC|WSTSS-)/,
  /^..U.(ND----|NBS---|NBR---|NBW---|NM----|NA----)/,
  /^G.(?!O.[VLPI])/,
]

// With unfilled frames.
const UNFILLED = [
  /^..U.(WM----|WMD---|WMG---|WMGD--|WMGX--|WMGE--|WMGC--|WMGR--|WMGO--|WMM---|WMMD--|WMMX--|WMME--|WMMC--|WMMR--|WMMO--|WMF---)/,
  /^..U.(WMFD--|WMFX--|WMFE--|WMFC--|WMFR--|WMFO--|WMO---|WMOD--|WMX---|WME---|WMA---|WMC---|WMR---|WMB---|WMBD--|WMN---|WMS---)/,
  /^..U.(WMSX--|WMSD--|WDM---|WDMG--|WDMM--|E-----|V-----|X-----)/
]

const CIVILIAN = [/^..A.C/, /^..G.EVC/, /^..S.X/]

const STATUS = {
  ANTICIPATED: 'A',
  PLANNED: 'A',
  PRESENT: 'P',
  FULLY_CAPABLE: 'C',
  DAMAGED: 'D',
  DESTROYED: 'X',
  FULL_TO_CAPACITY: 'F'
}

const MOBILITY = {
  WHEELED_LIMITED: 'MO',
  WHEELED: 'MP',
  TRACKED: 'MQ',
  HALF_TRACK: 'MR',
  TOWED: 'MS',
  RAIL: 'MT',
  PACK_ANIMALS: 'MW',
  OVER_SNOW: 'MU',
  SLED: 'MV',
  BARGE: 'MX',
  AMPHIBIOUS: 'MY',
  TOWED_ARRAY_SHORT: 'NS',
  TOWED_ARRAY_LONG: 'NL'
}

const ECHELON = {
  TEAM: 'A', CREW: 'A',
  SQUAD: 'B',
  SECTION: 'C',
  PLATOON: 'D', DETACHMENT: 'D',
  COMPANY: 'E', BATTERY: 'E', TROOP: 'E',
  BATTALION: 'F',
  SQUADRON: 'F',
  REGIMENT: 'G', GROUP: 'G',
  BRIGADE: 'H',
  DIVISION: 'I',
  CORPS: 'J', MEF: 'J',
  ARMY: 'K',
  ARMY_GROUP: 'L', FRONT: 'L',
  REGION: 'M', THEATER: 'M',
  COMMAND: 'N'
}

// TODO: use Set()
const FEINT_DUMMY = ['C', 'D', 'F', 'G']
const HEADQUARTERS = ['A', 'B', 'C', 'D']
const TASK_FORCE = ['B', 'D', 'E', 'G']
