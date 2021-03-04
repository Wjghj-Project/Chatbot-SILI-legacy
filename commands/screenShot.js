const screenShot = require('../utils/screenShot')
const reply = require('../utils/reply')
const { koishi } = require('../index')

module.exports = () => {
  koishi
    .command('screenshot <url>', {
      authority: 3,
    })
    .option('selector', '-s <selector>')
    .alias('截图')
    .action(async ({ session, options }, url) => {
      if (options.selector === true) options.selector = undefined
      let image = await screenShot(url, options.selector)
      session.send(`${url} 的网页截图：${image}`)
    })
}
