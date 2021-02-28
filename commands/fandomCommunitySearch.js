const axios = require('axios')

/**
 * @module command-fandomCommunitySearch
 */
module.exports = ({ koishi }) => {
  // koishi
  koishi
    .command(
      'fandom-community-search <wiki> 通过名称搜索Fandom Wiki，预设搜索语言为zh'
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
        // {
        //   "total": 1,
        //   "batches": 1,
        //   "currentBatch": 1,
        //   "next": null,
        //   "items": [
        //     {
        //       "id": "1945950",
        //       "title": "No Game No Life 游戏人生 Wiki",
        //       "url": "https://ngnl.fandom.com/zh/",
        //       "topic": "Anime",
        //       "desc": "No Game No Life 游戏人生 Wiki是一个任何人都可以贡献的线上社区网站。你可以发现、分享和添加知识！",
        //       "stats": {
        //         "articles": 200,
        //         "images": 10,
        //         "videos": 0
        //       },
        //       "image": "https://community.fandom.com/extensions/wikia/Search/images/fandom_image_placeholder.jpg",
        //       "language": "zh"
        //     }
        //   ]
        // }
        var ping = new Date().getTime() - timeBefore

        // if error
        if (err) {
          session.send('搜索 wiki 时出现问题 TAT')
          return
        }

        // if no wiki
        if (data.items.length < 1) {
          session.send(
            `喵，关键词“${wiki}”未能匹配到 wiki，请尝试更改语言或者关键词~`
          )
          return
        }

        var nth = isNaN(options.nth) ? 1 : options.nth
        if (nth > 10 || nth < 1 || nth > data.items.length) nth = 1
        var indexNth = nth - 1
        var theWiki = data.items[indexNth]

        // 创建空数组
        var text = [
          `[CQ:image,file=${theWiki.image}]`,
          theWiki.title,
          theWiki.url,
          '',
          `简介：${theWiki.desc}`,
          `主题：${theWiki.topic}`,
          `统计：共 ${theWiki.stats.articles} 个文章页面、${theWiki.stats.images} 个媒体文件`,
          '',
          `(第${nth}/${data.total}个结果，耗时: ${ping}ms)`,
        ]

        // 合并数组为字符串
        text = text.join('\n')
        // 起飞
        session.send(text)
      })
    })
}

function makeSearch({ wiki = '', lang = 'zh' }, next) {
  console.log('Search Fandom wiki:', wiki + ' | Lang: ' + lang)

  // GET 网页内容
  axios
    .get('https://community.fandom.com/api/v1/Search/CrossWiki', {
      params: {
        query: wiki,
        lang,
        limit: 25,
      },
    })
    .then(({ data }) => {
      console.log('Done search wiki')
      next(null, data)
    })
    .catch(error => {
      console.error('Error when search wiki')
      next(error, null)
    })
}
