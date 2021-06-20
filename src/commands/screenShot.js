const screenShot = require('../utils/screenShot')
const { koishi } = require('../index')

module.exports = () => {
  koishi
    .command('screenshot <url>', {
      authority: 3,
    })
    .alias('截图', 'shot')
    .option('selector', '-s <selector>')
    .action(async ({ session, options }, url) => {
      if (options.selector === true) options.selector = undefined
      let image = await screenShot(url, options.selector)
      session.send(`${url} 的网页截图：${image}`)
    })
}
