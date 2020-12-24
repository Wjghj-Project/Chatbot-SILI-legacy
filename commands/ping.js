const random = require('../utils/random')

/**
 * @module command-ping
 */
module.exports = ({ koishi }) => {
  koishi
    .command('ping', '应答测试')
    .alias('在吗', '测试', '!')
    .action(({ meta }) => {
      var now = new Date().getTime()
      var ping = now - meta.time * 1000
      console.log('now', now, 'meta', meta.time)
      var randomReply = random([
        'pong~',
        '诶，我在~',
        '叫我干嘛呀~',
        'Link start~',
        'Aye Aye Captain~',
        "I'm still alive~",
      ])
      meta.$send(randomReply)
    })
}
