const sysLog = require('../utils/sysLog')
// const { segment } = require('koishi-utils')
const { koishi } = require('../index')

module.exports = () => {
  // 收到消息
  koishi.on('message', (session) => {
    // 保留记录
    switch (session.subtype) {
      case 'private':
        sysLog('✉', '私信', session.userId, session.content)
        break
      case 'group':
        sysLog(
          '✉',
          `[${session.platform}]`,
          '群消息',
          '群' + session.groupId,
          `${session.author.username || session.author.nickname}${
            session.author.discriminator
              ? '#' + session.author.discriminator
              : ''
          }(${session.author.userId})`,
          session.content
        )
        break
      case 'guild':
        sysLog(
          '✉',
          `[${session.platform}]`,
          '频道消息',
          session.channelId.split(':').pop(),
          `${session.author.username || session.author.nickname}(${
            session.author.userId
          })`,
          session.content
        )
        break
      default:
        sysLog(
          '✉',
          '其他消息',
          '类型' + session.type,
          '子类型' + session.subtype,
          '用户' + session.userId,
          session.content
        )
        break
    }
  })
}
