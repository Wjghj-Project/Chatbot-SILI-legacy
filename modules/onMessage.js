const sysLog = require('../utils/sysLog')

module.exports = ({ koishi }) => {
  /**
   * @methid 任意消息事件监听
   */
  // 收到消息
  koishi.on('message', session => {
    // 保留记录
    switch (session.subtype) {
      case 'private':
        sysLog('✉', '收到私信', session.userId, session.message)
        break
      case 'group':
        sysLog(
          '✉',
          '收到群消息',
          '群' + session.groupId,
          '用户' + session.userId,
          session.message
        )
        break
      default:
        sysLog(
          '✉',
          '收到其他消息',
          '类型' + session.type,
          '子类型' + session.subtype,
          '用户' + session.userId,
          session.message
        )
        break
    }
  })
}
