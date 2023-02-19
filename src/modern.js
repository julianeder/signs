const SIDC = function (sidc, standard = '2525') {
  this.type = 'MODERN'
  this.sidc = sidc
  this.standard = standard

  const parts = {
    context: sidc[2],
    affiliation: sidc[3],
    symbolSet: sidc.substring(4, 6),
    status: sidc[6],
    indicator: sidc[7],
    amplifier: sidc.substring(8, 10),
    entity: sidc.substring(10, 12),
    type: sidc.substring(12, 14),
    subtype: sidc.substring(14, 16),
    function: sidc.substring(10, 16),
    modifier1: sidc.substring(16, 18),
    modifier2: sidc.substring(18, 20)
  }

  this.generic = parts.symbolSet + ':' + parts.function
  this.context = CONTEXT[parts.context]
  this.affiliation =
    AFFILIATION[parts.context + parts.affiliation] ||
    AFFILIATION[parts.affiliation]

  // FIXME: wrong shape for joker
  this.joker = this.context === 'EXERCISE' && parts.affiliation === '5' // SUSPECT
  this.faker = this.context === 'EXERCISE' && parts.affiliation === '6' // HOSTILE
  this.status = Object.entries(STATUS).find(([_, code]) => code === parts.status)[0]
  this.dimension = DIMENSION.find(([regex]) => sidc.match(regex))[1]
  this.civilian = CIVILIAN.some(regex => sidc.match(regex))
  // TODO: PENDING - ETC/POSCON tracks, fused tracks
  this.pending = !this.joker && PENDING.includes(parts.affiliation)
  this.installation = this.dimension === 'UNIT' && parts.symbolSet === '20'
  this.taskForce = TASK_FORCE.includes(parts.indicator)
  this.headquarters = HEADQUARTERS.includes(parts.indicator)
  this.feintDummy = FEINT_DUMMY.includes(parts.indicator)

  this.mobility = (() => {
    const lookup = ([_, code]) => code === parts.amplifier
    const mobility = Object.entries(MOBILITY).find(lookup)
    return mobility ? mobility[0] : false
  })()

  this.echelon = !this.mobility && (() => {
    const lookup = ([_, code]) => code === parts.amplifier
    const echelon = Object.entries(ECHELON).find(lookup)
    return echelon ? echelon[0] : false
  })()
}

export default SIDC

const CONTEXT = ['REALITY', 'EXERCISE', 'SIMULATION']

export const IDENTITY = {
  PENDING: '0',
  UNKNOWN: '1',
  ASSUMED_FRIEND: '2',
  FRIEND: '3',
  NEUTRAL: '4',
  SUSPECT: '5', JOKER: '5',
  HOSTILE: '6', FAKER: '6'
}

const PENDING = ['0', '2', '5']

const AFFILIATION = {
  '15': 'FRIEND',
  '16': 'FRIEND',
  '0': 'UNKNOWN', '1': 'UNKNOWN',
  '2': 'FRIEND', '3': 'FRIEND',
  '4': 'NEUTRAL',
  '5': 'HOSTILE', '6': 'HOSTILE'
}

const DIMENSION = [
  [/^....(15)/, 'EQUIPMENT'],
  [/^....(05|06|50)/, 'SPACE'],
  [/^....(01|02|51)/, 'AIR'],
  [/^....20/, 'INSTALLATION'],
  [/^....27/, 'DISMOUNTED'],
  [/^....30/, 'SEA'],
  [/^....(35|36|39|45)/, 'SUBSURFACE'],
  [/^....40/, 'ACTIVITY'],
  [/^....(10|11|12|15|20|27|30|52|60)/, 'UNIT'], // incl. DISMOUNTED
]

const CIVILIAN = [
  /^....01....12/,
  /^....05....12/,
  /^....11/,
  /^....12....12/,
  /^....15....16/,
  /^....30....14/
]

const STATUS = {
  PRESENT: '0',
  PLANNED: '1', ANTICIPATED: '1',
  FULLY_CAPABLE: '2',
  DAMAGED: '3',
  DESTROYED: '4',
  FULL_TO_CAPACITY: '5'
}

export const ECHELON = {
  TEAM: '11', // CREW: '11',
  SQUAD: '12',
  SECTION: '13',
  PLATOON: '14', // DETACHMENT: '14',
  COMPANY: '15', // BATTERY: '15', TROOP: '15',
  BATTALION: '16', // SQUADRON: '16',
  REGIMENT: '17', // GROUP: '17',
  BRIGADE: '18',
  DIVISION: '21',
  CORPS: '22', // MEF: '22',
  ARMY: '23',
  ARMY_GROUP: '24', // FRONT: '24',
  REGION: '25', // THEATER: '25',
  COMMAND: '26'
}

export const MOBILITY = {
  WHEELED_LIMITED: '31',
  WHEELED: '32',
  TRACKED: '33',
  HALF_TRACK: '34',
  TOWED: '35',
  RAIL: '36',
  PACK_ANIMALS: '37',
  OVER_SNOW: '41',
  SLED: '42',
  BARGE: '51',
  AMPHIBIOUS: '52',
  TOWED_ARRAY_SHORT: '61',
  TOWED_ARRAY_LONG: '62'
}

const FEINT_DUMMY = ['1', '3', '5', '7']
const HEADQUARTERS = ['2', '3', '6', '7']
const TASK_FORCE = ['4', '5', '6', '7']
