const sysLog = require('../utils/sysLog')
// const { mySelf } = require('../secret/qqNumber').user
const { koishi } = require('../index')
const { segment } = require('koishi')
// const { segment } = require('koishi-utils')
// const bots = require('../utils/bots')

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

  // // 群成员增加
  // koishi.on('group-member-added', async (session) => {
  //   sysLog(
  //     '🔰',
  //     '检测到群成员增加',
  //     '群' + session.groupId,
  //     '用户' + session.userId
  //   )
  //   if (session.userId === session.selfId) {
  //     sysLog('💌', '检测到加入群聊，发送自我介绍')
  //     session.execute('about')
  //   }
  // })

  // // 群成员减少
  // koishi.on('group-member-deleted', (session) => {
  //   sysLog('💔', '检测到群成员减少', session)
  // })

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
  koishi.unselect('user').before('command', ({ session, command }) => {
    console.info(
      !session.channel.disable?.includes(command.name),
      command.name,
      session.channel.disable
    )
  })
  koishi.on('command', (argv) => {
    const { session, command } = argv
    sysLog(
      '🤖',
      '指令调用',
      `${command.name} ${session.userId} [原文：${session.content}]`
    )
  })
}
