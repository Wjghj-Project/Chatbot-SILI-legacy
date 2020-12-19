const axios = require('axios').default

module.exports = ({ koishi }) => {
  koishi
    .command(
      'wiki <pagename>',
      '发送 wiki 链接（本功能需要 QQ 群申请链接到某个 MediaWiki 网站）'
    )
    // .alias('')
    .action(({ meta }, pagename) => {
      if (!meta.groupId) {
        meta.$send('本功能仅限QQ群使用。')
        return
      }
      if (!pagename) pagename = ''
      koishi.database.getGroup(meta.groupId, ['mwApi']).then(({ mwApi }) => {
        if (!mwApi) {
          meta.$send('本功能需要 QQ 群申请链接到某个 MediaWiki 网站')
          return
        }

        var link =
          mwApi.replace('api.php', 'index.php?title=') + encodeURI(pageName)

        axios
          .get(mwApi, {
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
      })
    })
}
