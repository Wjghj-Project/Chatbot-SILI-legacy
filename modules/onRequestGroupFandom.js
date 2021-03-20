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
    .on('group-member-request', session => {
      // sysLog('💭', '收到入群申请', session)
      const { userId, groupId, content } = session
      const answer = content.split('答案：')[1] || ''

      var command = `!verify-qq --qq ${userId} --user ${answer}`
      bots.onebot().sendMsg(groupId, command)

      verifyQQ(
        session,
        {
          qq: userId,
          user: answer,
        },
        ({ msg, status }) => {
          bots.onebot().sendMsg(groupId, msg)
          if (status === true) {
            bots.onebot().handleGroupRequest(session.messageId, true)
            bots.onebot().sendMsg(groupId, '已自动通过入群申请')
          } else {
            // 修正用户名
            var userName = answer.trim()
            userName = userName.replace(/^user:/i, '')
            userName = userName.replace(/\s/g, '_')
            userName = userName.split('')
            var _userNameFirst = userName.shift().toUpperCase()
            userName = _userNameFirst + userName.join('')

            bots.onebot().sendMsg(
              groupId,
              [
                '请手动检查该用户信息:',
                'https://community.fandom.com/wiki/Special:Lookupuser/' +
                  userName,
                '复制拒绝理由: QQ号验证失败，请参阅群说明',
              ].join('\n')
            )
            // session.$reject('QQ号验证失败，请参阅群说明')
          }
        }
      )
    })
}
