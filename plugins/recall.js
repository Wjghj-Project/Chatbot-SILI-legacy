/**
 * @name koishi-plugin-recall 撤回消息
 * @author i'DLisT
 */
const { find } = require('lodash')

const maxRecall = 10
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
        msg: [session.messageId],
      })
    }
  })

  ctx
    .command('admin/recall [num:number]', '撤回消息', {})
    .userFields(['authority'])
    .usage(`撤回 bot 发送的消息，最多 ${maxRecall} 条。仅限群管理员使用！`)
    .example('recall 5 (撤回 bot 最近发出的5条消息)')
    .action(({ session }, num) => {
      if (
        !['owner', 'admin'].includes(session?.sender?.role) &&
        session.user.authority < 2
      ) {
        return '权限不足'
      }
      let thisChannel = find(LastSent, o => o.channel == session.channelId)
      if (thisChannel) {
        if (thisChannel.msg.length < 1) {
          return '可撤回消息数已达上限。'
        } else {
          if (typeof num !== 'number') num = 1
          num = Math.max(1, num)
          num = Math.min(maxRecall, num)
          for (let i = 0; i < num && thisChannel.msg.length > 0; i++) {
            let latest = thisChannel.msg.pop()
            session.bot.deleteMessage(session.channelId, latest)
          }
        }
      } else {
        return '没有近期发送的消息。'
      }
    })
}
