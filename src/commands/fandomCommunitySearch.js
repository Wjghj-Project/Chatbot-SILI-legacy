const axios = require('axios').default
const cheerio = require('cheerio')
const { koishi } = require('../index')

/**
 * @module command-fandomCommunitySearch
 */
module.exports = () => {
  // koishi
  koishi
    .command(
      'fandom-community-search <wiki>',
      '通过名称搜索Fandom Wiki，预设搜索语言为zh'
    )
    .alias(
      '搜索fandom',
      'fandom-wiki-search',
      'search-fandom',
      'fandoms',
      'fms'
    )
    .option('lang', '-l <lang> 搜索的语言，例如en，预设zh', {
      fallback: 'zh',
    })
    .option('nth', '-n <num> 展示第几个结果', { fallback: 1 })
    // .shortcut('搜索fandom', { prefix: true, fuzzy: true })
    .action(({ session, options }, wiki) => {
      var timeBefore = new Date().getTime()
      var lang = options.lang || 'zh'

      // makeSearch
      makeSearch({ wiki, lang }, (err, data) => {
        var ping = new Date().getTime() - timeBefore

        // if error
        if (err) {
          session.send('搜索 wiki 时出现问题 TAT')
          return
        }

        // if no wiki
        if (data.length < 1) {
          session.send(
            `喵，关键词“${wiki}”未能匹配到 wiki，请尝试更改语言或者关键词~`
          )
          return
        }

        var nth = isNaN(options.nth) ? 1 : options.nth
        if (nth > 10 || nth < 1 || nth > data.length) nth = 1
        var indexNth = nth - 1
        var wikiData = data[indexNth]

        // 创建空数组
        var text = [
          `[CQ:image,url=${wikiData.image}]`,
          wikiData.name,
          wikiData.link,
          '',
          `简介：${wikiData.desc}`,
          `主题：${wikiData.hub}`,
          `统计：共 ${wikiData.stats.pages}、${wikiData.stats.images}、${wikiData.stats.videos}`,
          '',
          `(第${nth}/${data.length}个结果，耗时: ${ping}ms)`,
        ]

        // 合并数组为字符串
        text = text.join('\n')
        // 起飞
        session.send(text)
      })
    })
}

function makeSearch({ wiki = '', lang = 'zh' }, next) {
  // console.log('Search Fandom wiki:', wiki + ' | Lang: ' + lang)

  // GET 网页内容
  axios
    .get('https://community.fandom.com/wiki/Special:SearchCommunity', {
      params: {
        query: wiki,
        scope: 'community',
        resultsLang: lang,
        uselang: 'zh',
      },
    })
    .then(({ data: html }) => {
      const $ = cheerio.load(html)
      let data = []
      $('li.unified-search__result').each((index, el) => {
        let $el = $(el)
        let wiki = {}
        wiki.image = $el.find('.wikiPromoteThumbnail').attr('src')
        wiki.name = $el
          .find('.unified-search__result__title')
          .text()
          .trim()
        wiki.hub = $el
          .find('.unified-search__result__community__content__hub')
          .text()
          .trim()
        wiki.desc = $el
          .find('.unified-search__result__community__description')
          .text()
          .trim()
        wiki.link = $el.find('.unified-search__result__link').attr('href')
        let $stats = $el.find(
          '.unified-search__result__community__content__statistics li'
        )
        wiki.stats = {
          pages: $($stats.get(0))
            .text()
            .trim(),
          images: $($stats.get(1))
            .text()
            .trim(),
          videos: $($stats.get(2))
            .text()
            .trim(),
        }
        data.push(wiki)
      })
      // console.log('Done search wiki', data)
      next(null, data)
    })
    .catch(error => {
      console.error('Error when search wiki', error)
      next(error, null)
    })
}
