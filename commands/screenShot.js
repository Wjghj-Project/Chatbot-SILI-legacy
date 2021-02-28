const screenShot = require('../utils/screenShot')
const reply = require('../utils/reply')

module.exports = ({ koishi }) => {
  koishi
    .command('screenshot <url>', {
      authority: 3,
    })
    .alias('截图')
    .action(async ({ session }, url) => {
      if (!url || !/^https?:\/\//.test(url)) {
        session.send('URL 不正确！')
        return
      }

      let image = await screenShot(url)
      session.send(`${url} 的网页截图：${image}`)
    })
}
