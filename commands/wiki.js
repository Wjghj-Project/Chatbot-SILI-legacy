const axios = require('axios').default
const reply = require('../utils/reply')
const resolveBrackets = require('../utils/resolveBrackets')

module.exports = ({ koishi }) => {
  koishi
    .command(
      'wiki <pagename...>',
      '发送 wiki 链接（本功能需要 QQ 群申请链接到某个 MediaWiki 网站）'
    )
    // .alias('')
    .option('--info', 'MediaWiki link info')
    .option('--set <api>', 'Set MediaWiki API', {
      authority: 3,
    })
    .option('--silent', null, {
      type: 'boolean',
    })
    .action(({ meta, options }, pagename) => {
      if (options.set) {
        koishi.database
          .setGroup(meta.groupId, {
            mwApi: options.set,
          })
          .then(
            () => {
              reply(meta, '成功将QQ群与wiki连接')
            },
            () => {
              reply(meta, '将QQ群与wiki连接时发生错误')
            }
          )
        return
      }
      if (!meta.groupId) {
        if (!options.silent) reply(meta, '本功能仅限QQ群使用。')
        return
      }
      koishi.database.getGroup(meta.groupId, ['mwApi']).then(({ mwApi }) => {
        if (options.info) {
          reply(
            meta,
            `{\n  "groupId": ${meta.groupId},\n  "mwApi": "${mwApi}"\n}`
          )
          return
        }

        if (!mwApi) {
          if (!options.silent)
            reply(meta, '本功能需要 QQ 群申请链接到某个 MediaWiki 网站')
          return
        }

        var link =
          mwApi.replace('api.php', 'index.php?title=') + encodeURI(pagename)

        if (!pagename) {
          reply(meta, mwApi.replace('api.php', 'index.php'))
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
              reply(meta, link)
            },
            err => {
              console.error('Axios 错误', err)
              reply(meta, link + ' (似乎出现错误)')
            }
          )
      })
    })

  // koishi.receiver.on('message', meta => {
  //   // wikiUrl
  //   meta.message = resolveBrackets(meta.message)
  //   if (/\[\[.+\]\]/g.test(meta.message)) {
  //     var pageName = meta.message.replace(/.*\[\[(.+)\]\].*/g, '$1')
  //     pageName = pageName.trim()

  //     koishi.database.getGroup(meta.groupId, []).then(({ mwApi }) => {
  //       console.log(mwApi)
  //     })

  //     koishi.executeCommandLine(`wiki ${pageName} --silent`, meta)
  //   }
  // })
}
