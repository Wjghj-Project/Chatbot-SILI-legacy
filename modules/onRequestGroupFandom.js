const qqNumber = require('../secret/qqNumber')
const verifyQQ = require('../utils/verifyQQ')

/**
 * @module Fandom群入群申请
 */
module.exports = ({ koishi }) => {
  koishi
    .group(qqNumber.group.fandom, qqNumber.group.dftest)
    .receiver.on('request/group/add', meta => {
      // sysLog('💭', '收到入群申请', meta)
      const { userId, groupId, comment } = meta
      const answer = comment.split('答案：')[1] || ''

      var command = `!verify-qq --qq ${userId} --user ${answer}`
      koishi.sender.sendGroupMsg(groupId, command)

      verifyQQ(
        meta,
        {
          qq: userId,
          user: answer,
        },
        ({ msg, status }) => {
          koishi.sender.sendGroupMsg(groupId, msg)
          if (status === true) {
            meta.$approve()
            koishi.sender.sendGroupMsg(groupId, '已自动通过入群申请')
          } else {
            // 修正用户名
            var userName = answer.trim()
            userName = userName.replace(/^user:/i, '')
            userName = userName.replace(/\s/g, '_')
            userName = userName.split('')
            var _userNameFirst = userName.shift().toUpperCase()
            userName = _userNameFirst + userName.join('')

            koishi.sender.sendGroupMsg(
              groupId,
              [
                '请手动检查该用户信息:',
                'https://community.fandom.com/wiki/Special:Lookupuser/' +
                  userName,
                '复制拒绝理由: QQ号验证失败，请参阅群说明',
              ].join('\n')
            )
            // meta.$reject('QQ号验证失败，请参阅群说明')
          }
        }
      )
    })
}
