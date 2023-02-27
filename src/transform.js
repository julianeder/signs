/*
  matrix    (  a   b    c   d  e  f)

  a c e
  b d f
  0 0 1

  matrix    ( sx   0    0  sy tx ty)
  identity  (  1   0    0   1  0  0)
  translate (  1   0    0   1 tx ty)
  scale     ( sx   0    0  sy  0  0)
  rotate    (cos sin -sin cos  0  0)
*/

export const DEG2RAD = Math.PI / 180
export const identity = [1, 0, 0, 1, 0, 0]
export const translate = (v, tx, ty) => [v[0], v[1], v[2], v[3], v[4] + tx, v[5] + ty]
export const rotate = a => [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0]

export const matrix = v => `matrix(${v.join(' ')})`
