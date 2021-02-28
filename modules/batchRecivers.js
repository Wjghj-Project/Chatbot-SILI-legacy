const sysLog = require('../utils/sysLog')

module.exports = ({ koishi }) => {
  // 添加好友
  koishi.on('friend-added', session => {
    sysLog('❤', '已添加好友', session)
  })

  // 入群申请
  koishi.on('group-member-request', session => {
    sysLog('💭', '收到入群申请', session)
  })

  // 加群邀请
  koishi.on('group-request', session => {
    sysLog('💌', '收到加群邀请', '群' + session.groupId, '√通过')
    session.$approve()
  })

  // 群成员增加
  koishi.on('group-member-added', session => {
    sysLog('🔰', '检测到群成员增加', '群' + session.groupId, '用户' + session.userId)
    if (session.userId === session.selfId) {
      // sysLog('💌', '检测到加入群聊，发送自我介绍')
      // koishi.executeCommandLine('about', session)
    } else {
      koishi.sender.sendGroupMsg(
        session.groupId,
        '❤群成员增加了，[CQ:at,qq=' + session.userId + ']欢迎新大佬！'
      )
    }
  })

  // 群成员减少
  koishi.on('group-deleted', session => {
    sysLog('💔', '检测到群成员减少', session)
    koishi.sender.sendGroupMsg(
      session.groupId,
      '💔成员 ' + session.userId + ' 离开了我们，sayonara。'
    )
  })

  // 群管理变动
  koishi.on('group-member/role', session => {
    sysLog(
      '🔰',
      '发生群管理员变动',
      '群' + session.groupId,
      '用户' + session.userId,
      session.subType === 'set' ? '+上任' : '-撤销'
    )
  })

  // 指令调用
  koishi.on('command', data => {
    sysLog(
      '🤖',
      '发生指令调用事件',
      data.session.userId,
      '触发指令:' + data.command.name
    )
  })
}
