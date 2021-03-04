const axios = require('axios').default
const reply = require('../utils/reply')
const resolveBrackets = require('../utils/resolveBrackets')

module.exports = ({ koishi }) => {
  koishi
    .command(
      'wiki <pagename:text>',
      '发送 wiki 链接（本功能需要 QQ 群申请链接到某个 MediaWiki 网站）'
    )
    // .alias('')
    .option('info', '-i MediaWiki link info')
    .option('set', '-s <api> Set MediaWiki API', {
      authority: 3,
    })
    .option('silent', '-S', {
      type: 'boolean',
    })
    .channelFields(['mwApi'])
    .action(({ session, options }, pagename) => {
      if (options.set) {
        session.database
          .setChannel(session.platform, session.groupId, {
            mwApi: options.set,
          })
          .then(
            () => {
              reply(session, '成功将QQ群与wiki连接')
            },
            () => {
              reply(session, '将QQ群与wiki连接时发生错误')
            }
          )
        return
      }
      if (!session.groupId) {
        if (!options.silent) reply(session, '本功能仅限QQ群使用。')
        return
      }

      let mwApi = session.channel.mwApi

      if (options.info) {
        reply(
          session,
          `{\n  "groupId": ${session.groupId},\n  "mwApi": "${mwApi}"\n}`
        )
        return
      }

      if (!mwApi) {
        if (!options.silent)
          reply(session, '本功能需要 QQ 群申请链接到某个 MediaWiki 网站')
        return
      }

      var link =
        mwApi.replace('api.php', 'index.php?title=') + encodeURI(pagename)

      if (!pagename) {
        reply(session, mwApi.replace('api.php', 'index.php'))
        return
      }

      axios
        .get(mwApi, {
          params: {
            format: 'json',
            action: 'query',
            prop: 'info',
            inprop: 'url',
            iwurl: true,
            titles: pagename,
          },
        })
        .then(
          ({ data }) => {
            var query = data.query
            if (query && query.pages) {
              var pages = query.pages
              link =
                pages[Object.keys(pages)[0]].fullurl || link + ' (可能不准确)'
              console.log('找到链接')
            } else if (query && query.interwiki) {
              link = query.interwiki[0].url || link
              console.log('找到跨语言链接')
            } else {
              console.log('页面不存在？')
            }
            reply(session, link)
          },
          err => {
            console.error('Axios 错误', err)
            reply(session, link + ' (似乎出现错误)')
          }
        )
    })
}
