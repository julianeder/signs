import chars from './chars.json'

const defaultWidth = chars['W']
export const width = s => [...s].reduce((acc, c) => acc + chars[c] || defaultWidth, 0)
