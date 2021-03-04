const random = require('../utils/random')
const { koishi } = require('../index')

/**
 * @module command-ping
 */
module.exports = () => {
  koishi
    .command('ping', '应答测试')
    .alias('在吗', '!')
    .action(({ session }) => {
      var now = new Date().getTime()
      var ping = now - session.time * 1000
      console.log('now', now, 'session', session.time)
      var randomReply = random([
        'pong~',
        '诶，我在~',
        '叫我干嘛呀~',
        'Link start~',
        'Aye Aye Captain~',
        "I'm still alive~",
      ])
      session.send(randomReply)
    })
}
