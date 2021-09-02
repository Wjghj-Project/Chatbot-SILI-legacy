const { koishi } = require('..')
const txt2img = require('../utils/txt2img')

module.exports = () => {
  koishi
    .command('tools/hljs <code:text>', 'Highlight.js', {
      minInterval: 5 * 1000,
    })
    .option('lang', '-l <lang:string>', { fallback: '' })
    .action(({ session, options }, code) => {
      if (!code) return session.execute('hljs -h')
      return txt2img.shotCode(code, options.lang)
    })
}
