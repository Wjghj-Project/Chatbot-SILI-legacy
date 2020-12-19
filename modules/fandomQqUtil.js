const axios = require('axios').default
const resolveBrackets = require('../utils/resolveBrackets')
const qqNumber = require('../secret/qqNumber')

/**
 * @module util-fandom-qq-group
 * @description Fandom QQ Group Extensions
 */
module.exports = ({ koishi }) => {
  koishi
    .group(qqNumber.group.fandom, qqNumber.group.dftest)
    .receiver.on('message', meta => {
      // wikiUrl
      meta.message = resolveBrackets(meta.message)
      if (/\[\[.+\]\]/g.test(meta.message)) {
        var pageName = meta.message.replace(/.*\[\[(.+)\]\].*/g, '$1')
        pageName = pageName.trim()

        koishi.executeCommandLine(`wiki ${pageName}`, meta)
      }

      // 关键词触发指令
      if (/(联系官方|zendesk|发工单)/i.test(meta.message)) {
        koishi.executeCommandLine('contact-fandom', meta)
      }
      if (/(帮助中心)/i.test(meta.message)) {
        koishi.executeCommandLine('fandom-help-center', meta)
      }
    })
}
