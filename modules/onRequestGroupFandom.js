const qqNumber = require('../secret/qqNumber')
const verifyQQ = require('../utils/verifyQQ')
const { koishi } = require('../index')
const bots = require('../utils/bots')

/**
 * @module Fandom群入群申请
 */
module.exports = () => {
  koishi
    .group(qqNumber.group.fandom, qqNumber.group.dftest)
    .command('ban', '自动验证黑名单系统', { authority: 2 })
    .option('add', '-a <user:posint> 新增黑名单记录')
    .option('remove', '-r <user:posint> 移除黑名单记录')
    .channelFields(['userBlacklist'])
    .action(async ({ session, options }) => {
      session.channel.userBlacklist = session.channel.userBlacklist || []

      if (options.add) {
        const user = String(options.add)

        try {
          session.bot?.$setGroupKick(session.groupId, user)
          // eslint-disable-next-line no-empty
        } catch (err) {}

        if (session.channel.userBlacklist.includes(user)) {
          return `${user} 已位于黑名单中。`
        } else {
          session.channel.userBlacklist.push(user)
          return `已将 ${user} 加入黑名单。`
        }
      }

      if (options.remove) {
        const user = String(options.remove)
        if (!session.channel.userBlacklist.includes(user)) {
          return `黑名单中没有与 ${user} 相关的记录。`
        } else {
          session.channel.userBlacklist.splice(
            session.channel.userBlacklist.indexOf(user),
            1
          )
          return `已将 ${user} 从黑名单中移除。`
        }
      }

      return session.channel.userBlacklist.length
        ? `本群黑名单上共有 ${
            session.channel.userBlacklist.length
          } 名用户：\n${session.channel.userBlacklist.join('、')}`
        : `哦耶，本群黑名单上尚无记录~`
    })

  koishi
    .group(qqNumber.group.fandom, qqNumber.group.dftest)
    .on('group-member-request', async (session) => {
      // sysLog('💭', '收到入群申请', session)
      const { userId, content } = session
      const answer = content.split('答案：')[1] || ''

      var command = `!verify-qq --qq ${userId} --user ${answer.trim()}`
      session.sendQueued(command)

      let msg, status
      try {
        const verify = await verifyQQ(session, {
          qq: userId,
          user: answer.trim(),
        })
        msg = verify.msg
        status = verify.status
      } catch (err) {
        koishi.logger('verify-qq').warn(err)
        return `查询时遇到错误：${err.message}`
      }

      session.sendQueued(msg)
      if (status === true) {
        try {
          await session.bot.handleGroupMemberRequest(session.messageId, true)
          session.sendQueued('已自动通过入群申请。')
        } catch (err) {
          session.sendQueued(`无法自动通过入群申请：${err}`)
        }
      } else {
        session.sendQueued(
          [
            '请手动检查该用户信息:',
            `https://community.fandom.com/wiki/Special:Lookupuser/${userName}`,
            '复制拒绝理由: QQ号验证失败，请参阅群说明',
          ].join('\n')
        )
      }
    })
}
