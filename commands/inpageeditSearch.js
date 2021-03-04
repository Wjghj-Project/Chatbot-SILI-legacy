const axios = require('axios').default
const { koishi } = require('../index')

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
      axios
        .get('https://api.wjghj.cn/inpageedit/query/wiki', {
          params: {
            sitename: sitename,
            sortby: '_total',
            sortorder: -1,
            prop: '_total|url|sitename|users',
          },
        })
        .then(res => {
          if (!res.data.query) {
            session.send('查询数据时出现错误。')
            return
          }
          var wikis = res.data.query
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
              msg.push(`${wikis[i].sitename}`)
              msg.push(`├ 链接: ${wikis[i].url}`)
              msg.push(`├ 次数: ${wikis[i]._total}`)
              msg.push(`└ 人数: ${Object.keys(wikis[i].users).length}`)
              msg.push('')
            }
            msg.push(`(查询耗时${(new Date().getTime() - before) / 1000}秒)`)
          } else {
            msg = [
              `关键词“${sitename}”共匹配到${wikis.length}个相关wiki~`,
              '试试别的关键词吧！',
            ]
          }
          session.send(msg.join('\n'))
        })
    })
}
