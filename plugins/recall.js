/**
 * @name koishi-plugin-recall 撤回消息
 * @author i'DLisT
 */
const { find } = require('lodash')

const maxRecall = 5
let LastSent = []

module.exports = ctx => {
  ctx.on('send', session => {
    let thisChannel = find(LastSent, o => o.channel == session.channelId)
    if (thisChannel) {
      thisChannel.msg.push(session.messageId)
      if (thisChannel.msg.length > maxRecall) thisChannel.msg.shift()
    } else {
      LastSent.push({
        channel: session.channelId,
        msg: [session.messageId]
      })
    }
  })

  ctx
    .command('recall', '撤回消息', { authority: 2 })
    .usage(`撤回发送的消息，最多${maxRecall}条。`)
    .action(({ session }) => {
      let thisChannel = find(LastSent, o => o.channel == session.channelId)
      if (thisChannel) {
        if (thisChannel.msg.length == 0) {
          return '可撤回消息数已达上限。'
        } else {
          let latest = thisChannel.msg.pop()
          session.bot.deleteMessage(session.channelId, latest)
        }
      } else {
        return '没有近期发送的消息。'
      }
    })
}
