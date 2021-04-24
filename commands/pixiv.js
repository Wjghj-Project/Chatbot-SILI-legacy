/**
 * @name cmd.pixiv 查询 Pixiv 插画
 * @desc 注意：pixivel.moe 服务条款不允许第三方爬取他们的数据
 *       本程序在使用前已征得开发者同意并将在合理范围内进行请求
 */
const { default: axios } = require('axios')
const { segment } = require('koishi-utils')
const { koishi } = require('..')

module.exports = () => {
  koishi
    .command('pixiv.illust <id:posint> 查询 Pixiv 插画', {
      minInterval: 10 * 1000,
    })
    .option('nth', '-n <nth:posint> 从多张插画中进行选择', { fallback: 1 })
    .action(async ({ options }, id) => {
      const { data } = await axios.get(`https://api.pixivel.moe/pixiv`, {
        data: {
          type: 'illust',
          id,
        },
      })
      const { error, illust } = data
      if (error || !illust) {
        koishi.logger('pixiv').warn(error)
        return error?.message || error?.user_message || '出现未知问题'
      }

      const allPics = illust.meta_pages
      const picNums = allPics.length
      const nth = Math.min(picNums, options.nth)

      const image = allPics[nth - 1].image_urls.original.replace(
        'https://i.pximg.net',
        'https://p1.pximg.pixivel.moe'
      )

      const message = [
        segment('image', {
          url: image,
        }),
        picNums > 1 ? `第 ${nth} 张，共 ${picNums} 张` : null,
        `标题：${illust.title}`,
        `作者：${illust.user.name}`,
        illust.caption.replace(/<br.*?\/>/g, '\n').replace(/\n\n/g, '\n'),
      ].join('\n')
      koishi.logger('pixiv').info(message)
      return message
    })

  koishi.middleware(session => {
    const reg = /(?:(?:https?:)?\/\/)?www\.pixiv\.net\/artworks\/([0-9]+)/i
    const pixivId = reg.exec(session.content)
    if (pixivId && pixivId[1]) {
      session.execute(`pixiv.illust ${pixivId[1]}`)
    }
  })
}
