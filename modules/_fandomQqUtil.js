const qqNumber = require('../secret/qqNumber')

/**
 * @module util-fandom-qq-group
 * @description Fandom QQ Group Extensions
 */
module.exports = ({ koishi }) => {
  koishi
    .group(qqNumber.group.fandom, qqNumber.group.dftest)
    .on('message', session => {
      // 关键词触发指令
      if (/(联系官方|zendesk|发工单)/i.test(session.message)) {
        koishi.executeCommandLine('contact-fandom', session)
      }
      if (/(帮助中心)/i.test(session.message)) {
        koishi.executeCommandLine('fandom-help-center', session)
      }
    })
}
