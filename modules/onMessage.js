const sysLog = require('../utils/sysLog')

module.exports = ({ koishi }) => {
  /**
   * @methid 任意消息事件监听
   */
  // 收到消息
  koishi.on('message', session => {
    // {
    //   anonymous: null,
    //   font: 0,
    //   groupId: '254794102',
    //   message: 'test',
    //   messageId: '426354350',
    //   rawMessage: 'test',
    //   selfId: '3338556752',
    //   sender: {
    //     age: 0,
    //     area: '',
    //     card: '',
    //     level: '',
    //     nickname: '机智的小鱼君⚡️',
    //     role: 'owner',
    //     sex: 'unknown',
    //     title: '',
    //     userId: 824399619
    //   },
    //   time: 1614527969,
    //   userId: '824399619',
    //   type: 'message',
    //   subtype: 'group',
    //   platform: 'onebot',
    //   channelId: '254794102',
    //   timestamp: 1614527969000,
    //   content: 'test',
    //   author: {
    //     userId: '824399619',
    //     username: '机智的小鱼君⚡️',
    //     nickname: '',
    //     anonymous: undefined
    //   }
    // }
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
