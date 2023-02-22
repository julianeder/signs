/* test principle wiring */
require('@babel/register')
const assert = require('assert')
const Symbol = require('../src')

console.log('Symbol', Symbol)

const fixture = [
  // ['LEGACY', 'SFGP------*****', '<svg xmlns="http://www.w3.org/2000/svg" version="1.2" baseProfile="tiny" width="158" height="108" viewBox="21 46 158 108" stroke-width="4" stroke="black" fill="none" font-family="Arial"><path d="M25,50 l150,0 0,100 -150,0 z" stroke-width="4" fill="rgb(128,224,255)"></path></svg>'],
  // ['MODERN', '10031000000000000000', '<svg xmlns="http://www.w3.org/2000/svg" version="1.2" baseProfile="tiny" width="158" height="108" viewBox="21 46 158 108" stroke-width="4" stroke="black" fill="none" font-family="Arial"><path d="M25,50 l150,0 0,100 -150,0 z" stroke-width="4" fill="rgb(128,224,255)"></path></svg>'],
  // ['SPECIAL', 'GFSPLCM---*****', '<svg xmlns="http://www.w3.org/2000/svg" version="1.2" baseProfile="tiny" width="208" height="208" viewBox="-4 -4 208 208" stroke-width="4" stroke="black" fill="none" font-family="Arial"><path d="m 13,75 v 46 H 137 v 28 L 187,100 138,51 v 24 z" stroke="black"></path></svg>'],
  ['SKKM', 'KFGPDI----', '']
]

describe('Symbol', function () {
  fixture.forEach(([label, sidc, expected]) => {
    it(label, function () {
      const actual = Symbol.of({ sidc }).asSVG()
      assert.equal(actual, expected)
    })
  })
})
