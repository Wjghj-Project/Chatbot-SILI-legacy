const sysLog = require('../utils/sysLog')
const { koishi } = require('../index')

module.exports = () => {
  // 添加好友
  koishi.on('friend-added', (session) => {
    sysLog('❤', '已添加好友', session)
  })

  // 入群申请
  koishi.on('group-member-request', (session) => {
    sysLog('💭', '收到入群申请', session)
  })

  // 加群邀请
  koishi.on('group-request', (session) => {
    sysLog('💌', '收到加群邀请', '群' + session.groupId)
    // bot.handelReauest()
  })

  // 群管理变动
  koishi.on('group-member/role', (session) => {
    sysLog(
      '🔰',
      '发生群管理员变动',
      '群' + session.groupId,
      '用户' + session.userId,
      session.subType === 'set' ? '+上任' : '-撤销'
    )
  })

  // 指令调用
  koishi.on('command', ({ session }) => {
    sysLog('🤖', '指令调用', session.userId, session.content)
  })
}
