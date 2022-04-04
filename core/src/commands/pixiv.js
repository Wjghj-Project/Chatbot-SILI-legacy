/**
 * @name cmd.pixiv 查询 Pixiv 插画
 */
const { default: axios } = require('axios')
const { segment } = require('koishi-utils')
const { koishi } = require('..')

const API_BASE = 'https://pixiv.js.org'

module.exports = () => {
  koishi
    .command('pixiv [id:posint]', 'Pixiv 相关功能')
    .action(({ session }, id) => {
      if (id) return session.execute(`pixiv.illust ${id}`)
      return session.execute('pixiv -h')
    })

  koishi
    .command('pixiv.illust <id:posint>', '查看 Pixiv 插画', {
      minInterval: 10 * 1000,
    })
    .alias('pixiv插画', 'p站插画', 'pixiv.i', 'pixiv.artwork')
    .option('page', '-p <p:posint> 从多张插画中进行选择', { fallback: 1 })
    .option('original', '-o 显示原画 (可能会慢很多)', { fallback: false })
    .action(async ({ session, options }, id) => {
      if (!id) return session.execute('pixiv.illust -h')

      koishi.logger('pixiv').info({ id, options })

      let data
      try {
        data = (await axios.get(`${API_BASE}/api/illust/${id}`)).data
      } catch (error) {
        koishi.logger('pixiv').warn(error)
        return [
          segment.quote(session.messageId),
          error?.response?.data?.message || error.message || '出现未知问题',
        ].join('')
      }

      let imageUrl = '',
        allPics,
        picNums,
        page = options.page

      allPics = data.pages
      picNums = allPics.length
      page = Math.min(picNums, page)
      imageUrl = options.original
        ? allPics[page - 1].urls.original
        : allPics[page - 1].urls.regular

      const desc = data.description
        .replace(/<br.*?\/>/g, '\n')
        .replace(/<\/?.+>/g, '')
      const allTags = data.tags.tags.map((i) => `#${i.tag}#`)

      const message = [
        segment.quote(session.messageId),
        segment.image(`${API_BASE}${imageUrl}`),
        picNums ? `第 ${page} 张，共 ${picNums} 张` : null,
        `标题：${data.title}`,
        `作者：${data.userName} (${data.userId})`,
        desc.length > 120 ? desc.substring(0, 120) + '...' : desc,
        `标签：${allTags.length > 0 ? allTags.join(' ') : '无'}`,
        `${API_BASE}/i/${data.id}`,
      ]
        .join('\n')
        .replace(/\n+/g, '\n')

      return message
    })

  koishi
    .command('pixiv.user <id:posint>')
    .alias('pixiv用户', 'p站用户', 'pixiv.u')
    .action(async ({ session }, id) => {
      if (!id) return session.execute('pixiv.user -h')

      let data
      try {
        data = (await axios.get(`${API_BASE}/api/user/${id}`)).data
      } catch (error) {
        koishi.logger('pixiv').warn(error)
        return [
          segment.quote(session.messageId),
          error.message || '出现未知问题',
        ].join('')
      }

      const { imageBig, userId, name, comment } = data

      const message = [
        segment.image(`${API_BASE}${imageBig}`),
        `${name} (${userId})`,
        comment,
      ].join('\n')

      return message
    })

  // 快捷方式
  koishi.middleware(async (session, next) => {
    await next()
    const reg =
      /(?:(?:https?:)?\/\/)?(?:www\.pixiv\.net|pixiv\.js\.org)\/(?:en\/)?(?:artworks|i)\/(\d+)/i
    const pixivId = reg.exec(session.content)
    if (pixivId && pixivId[1]) {
      session.execute(`pixiv.illust ${pixivId[1]}`)
    }
  })
}
