const sysLog = require('../utils/sysLog')
// const { segment } = require('koishi-utils')
const { koishi } = require('../index')

module.exports = () => {
  /**
   * @methid 任意消息事件监听
   */
  // 收到消息
  koishi.on('message', session => {
    // 保留记录
    switch (session.subtype) {
      case 'private':
        sysLog('✉', '收到私信', session.userId, session.content)
        break
      case 'group':
        sysLog(
          '✉',
          `[${session.platform}]`,
          '收到群消息',
          '群' + session.groupId,
          `${session.author.nickname}${
            session.author.discriminator
              ? '#' + session.author.discriminator
              : ''
          }(${session.author.userId})`,
          session.content
        )
        // console.log('group msg', session)
        break
      default:
        sysLog(
          '✉',
          '收到其他消息',
          '类型' + session.type,
          '子类型' + session.subtype,
          '用户' + session.userId,
          session.content
        )
        break
    }
  })
}
