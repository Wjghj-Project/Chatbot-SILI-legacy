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

        var link = 'https://community.fandom.com/zh/' + encodeURI(pageName)

        axios
          .get('https://community.fandom.com/zh/api.php', {
            params: {
              format: 'json',
              action: 'query',
              prop: 'info',
              inprop: 'url',
              iwurl: true,
              titles: encodeURI(pageName),
            },
          })
          .then(
            ({ data }) => {
              var query = data.query
              if (query.pages) {
                var pages = query.pages
                link = pages[Object.keys(pages)[0]].fullurl || link
              } else if (query.interwiki) {
                link = query.interwiki[0].url || link
              } else {
                link += ' (可能不准确)'
              }
              meta.$send(link)
            },
            err => {
              meta.$send(link + ' (似乎出现错误)')
              console.error(err)
            }
          )
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
