const sysLog = require('../utils/sysLog')

module.exports = ({ koishi }) => {
  // 添加好友
  koishi.receiver.on('friend-add', meta => {
    sysLog('❤', '已添加好友', meta)
  })

  // 入群申请
  koishi.receiver.on('request/group/add', meta => {
    sysLog('💭', '收到入群申请', meta)
  })

  // 加群邀请
  koishi.receiver.on('request/group/invite', meta => {
    sysLog('💌', '收到加群邀请', '群' + meta.groupId, '√通过')
    meta.$approve()
  })

  // 群成员增加
  koishi.receiver.on('group-increase/approve', meta => {
    sysLog('🔰', '检测到群成员增加', '群' + meta.groupId, '用户' + meta.userId)
    if (meta.userId === meta.selfId) {
      sysLog('💌', '检测到加入群聊，发送自我介绍')
      koishi.executeCommandLine('about', meta)
    } else {
      koishi.sender.sendGroupMsg(
        meta.groupId,
        '❤群成员增加了，[CQ:at,qq=' + meta.userId + ']欢迎新大佬！'
      )
    }
  })

  // 群成员减少
  koishi.receiver.on('group-decrease', meta => {
    sysLog('💔', '检测到群成员减少', meta)
    meta.$send('💔检测到群成员减少，sayonara。')
  })

  // 群管理变动
  koishi.receiver.on('group-admin', meta => {
    sysLog(
      '🔰',
      '发生群管理员变动',
      '群' + meta.groupId,
      '用户' + meta.userId,
      meta.subType === 'set' ? '+上任' : '-撤销'
    )
  })

  // 指令调用
  koishi.receiver.on('command', data => {
    sysLog(
      '🤖',
      '发生指令调用事件',
      data.meta.userId,
      '触发指令:' + data.command.name
    )
  })
}
