/* eslint-disable prettier/prettier */
module.exports = api => {

  // Do not cache this config, and re-execute the function every time.
  // https://babeljs.io/docs/config-files#apicache
  api.cache.never()

  const presets = [
    ['@babel/preset-env']
  ]

  return { presets }
}
