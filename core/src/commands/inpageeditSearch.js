const axios = require('axios').default
const { koishi, ctx } = require('../index')

module.exports = () => {
  /**
   * @module command-inpageeditSearch
   */
  koishi
    .command(
      'inpageedit-search <sitename>',
      '通过Wiki名称查询InPageEdit的使用情况'
    )
    .alias('ipe-search', 'ipes')
    .action(({ session }, sitename) => {
      var before = new Date().getTime()
      if (!sitename) sitename = ''
      return axios
        .get('https://a.ipe.wiki/api/search/wikis', {
          params: {
            siteName: sitename,
            sort: '!_total',
            limit: 3,
            prop: '_total|url|sitename|users',
          },
        })
        .then(({ data }) => {
          koishi.logger('ipes').info(JSON.stringify(data, null, 2))
          if (!data.body.search) {
            return '查询数据时出现错误。'
          }
          var wikis = data.body.search
          var msg = []
          if (wikis.length > 0) {
            if (sitename === '') {
              msg.push('InPageEdit排行榜')
            } else {
              msg.push('InPageEdit信息查询')
              msg.push(`关键词“${sitename}”共匹配到${wikis.length}个相关wiki~`)
            }
            var limit = 3
            if (limit > wikis.length) {
              limit = wikis.length
            } else {
              msg.push('* 只显示前3个')
            }
            msg.push('')
            for (let i = 0; i < limit; i++) {
              msg.push(`${wikis[i].siteName}`)
              msg.push(`├ 链接: ${wikis[i].siteUrl}`)
              msg.push(`└ 次数: ${wikis[i]._total}`)
              // msg.push(`└ 人数: ${Object.keys(wikis[i].users).length}`)
              msg.push('')
            }
            msg.push(`(查询耗时${(new Date().getTime() - before) / 1000}秒)`)
          } else {
            msg = [
              `关键词“${sitename}”共匹配到${wikis.length}个相关wiki~`,
              '试试别的关键词吧！',
            ]
          }
          return msg.join('\n')
        })
    })
}
