/**
 * @name cmd.pixiv 查询 Pixiv 插画
 * @desc 注意：pixivel.moe 服务条款不允许第三方爬取他们的数据
 *       本程序在使用前已征得开发者同意并将在合理范围内进行请求
 */
const { default: axios } = require('axios')
const { segment } = require('koishi-utils')
const { koishi } = require('..')

module.exports = () => {
  koishi.command('pixiv', 'Pixiv 相关功能').action(({ session }) => {
    return session.execute('pixiv -h')
  })

  koishi
    .command('pixiv.illust <id:posint>', '查询 Pixiv 插画', {
      minInterval: 10 * 1000,
    })
    .alias('pixiv插画', 'p站插画')
    .option('nth', '-n <nth:posint> 从多张插画中进行选择', { fallback: 1 })
    .action(async ({ session, options }, id) => {
      if (!id) return session.execute('pixiv.illust -h')

      const { data } = await axios.get(`https://api.pixivel.moe/pixiv`, {
        params: {
          type: 'illust',
          id,
        },
      })
      const { error, illust } = data
      if (error || !illust) {
        koishi.logger('pixiv').warn(error)
        return [
          segment('quote', { id: session.messageId }),
          error?.message || error?.user_message || '出现未知问题',
        ].join('')
      }

      let imageUrl = '',
        allPics,
        picNums,
        nth = options.nth

      if (illust?.meta_single_page?.original_image_url) {
        imageUrl = illust.meta_single_page.original_image_url
      } else {
        allPics = illust.meta_pages
        picNums = allPics.length
        nth = Math.min(picNums, nth)
        imageUrl = allPics[nth - 1].image_urls.original
      }

      const image = imageUrl.replace(
        'https://i.pximg.net',
        'https://p1.pximg.pixivel.moe'
      )
      const caption = illust.caption.replace(/<br.*?\/>/g, '\n')

      const message = [
        segment('quote', { id: session.messageId }),
        segment('image', {
          url: image,
        }),
        picNums ? `第 ${nth} 张，共 ${picNums} 张` : null,
        `标题：${illust.title}`,
        `作者：${illust.user.name}`,
        caption.length > 120 ? caption.substring(0, 120) + '...' : caption,
        'https://pixivel.moe/detail?id=' + illust.id,
      ]
        .join('\n')
        .replace(/\n+/g, '\n')
      koishi.logger('pixiv').info(message)
      return message
    })

  // 快捷方式
  koishi.middleware(session => {
    const reg = /(?:(?:https?:)?\/\/)?www\.pixiv\.net\/artworks\/([0-9]+)/i
    const pixivId = reg.exec(session.content)
    if (pixivId && pixivId[1]) {
      session.execute(`pixiv.illust ${pixivId[1]}`)
    }
  })
}
